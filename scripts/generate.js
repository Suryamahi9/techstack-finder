const fs = require('fs');
const path = require('path');

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/[^a-z0-9]/g, '');
}

function re(s) {
  return 'new RegExp("' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '","i")';
}

function p(type, regex, via, key) {
  const o = { type, regex: re(regex), via };
  if (key) o.key = key;
  return o;
}

const TEMPLATES = {
  js_react: (n) => [
    p('html', esc(n) + '.*production|__REACT_DEVTOOLS|data-reactroot|data-react-helmet|__REACT', n + ' HTML markers'),
    p('script_src', esc(n) + '[\\\\/.].*\\\\.js|' + esc(n) + '\\\\.production', n + ' script'),
    p('browser_var', n.replace(/[^a-zA-Z0-9]/g, ''), n + ' global'),
  ],
  js_vue: (n) => [
    p('html', '__vue_app__|data-v-[a-z0-9]|v-cloak|v-bind:|v-on:|' + esc(n), n + ' HTML markers'),
    p('script_src', esc(n) + '[\\\\/.].*\\\\.js|' + esc(n) + '\\\\.runtime', n + ' script'),
    p('browser_var', n.replace(/[^a-zA-Z0-9]/g, ''), n + ' global'),
  ],
  js_angular: (n) => [
    p('html', 'ng-version|_ngcontent|ng-app|ng-controller|ng-component|' + esc(n), n + ' HTML markers'),
    p('script_src', esc(n) + '.*\\\\.js|' + esc(n) + '\\\\.production', n + ' script'),
    p('browser_var', 'ng|angular', n + ' global'),
  ],
  js_svelte: (n) => [
    p('html', 'svelte-[a-z0-9]{6}|svelte-[a-z0-9]+-[a-z0-9]+|__svelte__|' + esc(n), n + ' HTML markers'),
    p('script_src', esc(n) + '.*\\\\.js|' + esc(n) + '\\\\.min', n + ' script'),
  ],
  js_next: (n) => [
    p('html', '__NEXT_DATA__|\\/_next\\/static|\\/_next\\/image|next\\/image|next\\/link|next\\/head|' + esc(n), n + ' HTML markers'),
    p('header', 'x-powered-by', 'next\\.?js|Next\\.js', n + ' header'),
    p('path_probe', '\\/_next\\/', n + ' path probe'),
    p('script_src', '\\/_next\\/', n + ' script'),
  ],
  js_nuxt: (n) => [
    p('html', '__NUXT__|\\/_nuxt\\/|data-n-head|nuxt-link|NuxtLink|' + esc(n), n + ' HTML markers'),
    p('header', 'x-powered-by', 'nuxt|Nuxt', n + ' header'),
    p('path_probe', '\\/_nuxt\\/', n + ' path probe'),
    p('script_src', '\\/_nuxt\\/', n + ' script'),
  ],
  js_gatsby: (n) => [
    p('html', '___gatsby|gatsby-|GATSBY|' + esc(n), n + ' HTML markers'),
    p('path_probe', '\\/static\\/', n + ' path probe'),
    p('script_src', 'gatsby', n + ' script'),
  ],
  js_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|' + esc(n) + '\\.umd|cdn.*' + esc(n) + '|unpkg.*' + esc(n) + '|jsdelivr.*' + esc(n) + '|cdnjs.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|' + slug(n), n + ' HTML marker'),
    p('browser_var', slug(n).substring(0, 15), n + ' global variable'),
  ],
  css_fw: (n) => [
    p('css_class', esc(n) + '|container-fluid|row-fluid|col-md|col-lg|col-sm|btn-primary|navbar-nav|card-body|modal-content|alert-', n + ' CSS classes'),
    p('link_tag', esc(n) + '\\\\.min\\.css|' + esc(n) + '\\\\.css|cdn.*' + esc(n) + '.*css', n + ' stylesheet'),
    p('html', esc(n) + '|' + slug(n), n + ' HTML marker'),
    p('meta_generator', esc(n), n + ' meta generator'),
  ],
  ui_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|data-' + slug(n).substring(0, 10), n + ' HTML marker'),
    p('css_class', slug(n).substring(0, 10) + '-|' + n.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 8), n + ' CSS class prefix'),
  ],
  anim_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|data-aos|data-wow|animation-delay|transition:.*transform', n + ' animation markers'),
    p('js_content', esc(n) + '\\.|requestAnimationFrame.*' + esc(n), n + ' JS API'),
  ],
  chart_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', '<canvas|<svg.*chart|chartjs|echarts|highcharts|plotly|' + esc(n), n + ' chart markers'),
    p('browser_var', slug(n).substring(0, 12), n + ' global'),
  ],
  editor_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'contenteditable|ProseMirror|tiptap|quill|CodeMirror|monaco|ace-editor|' + esc(n), n + ' editor markers'),
    p('css_class', 'ProseMirror|cm-editor|monaco|ace_|ql-|tiptap|' + slug(n).substring(0, 8), n + ' editor CSS'),
  ],
  form_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'data-form|data-validate|formik|react-hook-form|v-validate|' + esc(n), n + ' form markers'),
  ],
  state_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|store|createStore|useStore|useSelector|useDispatch|' + n.toLowerCase(), n + ' state markers'),
    p('browser_var', slug(n).substring(0, 12), n + ' global'),
  ],
  test_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'data-testid|data-test|describe\\(|it\\(|test\\(|expect\\(|' + esc(n), n + ' test markers'),
    p('js_content', 'jest|vitest|mocha|cypress|playwright|' + esc(n), n + ' test framework'),
  ],
  build_tool: (n) => [
    p('script_src', esc(n) + '\\\\.js|cdn.*' + esc(n) + '|webpack|vite|rollup|esbuild|parcel|snowpack|' + esc(n), n + ' bundle'),
    p('html', '__webpack_hmr|__vite__|__parcel|' + esc(n), n + ' markers'),
    p('path_probe', '\\/webpack\\.js|\\/vite\\.js|' + esc(n), n + ' probe'),
  ],
  meta_fw: (n) => [
    p('html', '__NEXT_DATA__|__NUXT__|___gatsby|svelte-kit|astro-|remix-|qwik-|fresh-|' + esc(n), n + ' meta-framework markers'),
    p('header', 'x-powered-by', 'next|nuxt|gatsby|svelte|remix|astro|qwik|' + esc(n), n + ' header'),
    p('path_probe', '\\/_next\\/|\\/_nuxt\\/|\\/static\\/|' + esc(n), n + ' path'),
    p('script_src', '\\/_next\\/|\\/_nuxt\\/|' + esc(n), n + ' script'),
  ],
  mobile_fw: (n) => [
    p('html', 'react-native|flutter|ionic|nativescript|capacitor|cordova|' + esc(n), n + ' mobile markers'),
    p('script_src', esc(n) + '\\\\.js|cordova|capacitor|' + esc(n), n + ' script'),
    p('header', 'x-powered-by', esc(n), n + ' header'),
  ],
  ssr_fw: (n) => [
    p('html', 'server-rendered|ssr|hydrat|' + esc(n), n + ' SSR markers'),
    p('header', 'x-powered-by', esc(n), n + ' header'),
    p('path_probe', esc(n), n + ' path probe'),
  ],
  graphql_cl: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'graphql|__schema|gql\\`|useQuery|useMutation|ApolloClient|' + esc(n), n + ' GraphQL markers'),
    p('header', 'content-type', 'application\\/graphql', n + ' GraphQL header'),
  ],
  router_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'react-router|vue-router|wouter|@reach/router|route|Router|' + esc(n), n + ' routing markers'),
  ],
  i18n_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'i18n|intl|locale|translate|localization|' + esc(n), n + ' i18n markers'),
  ],
  util_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n) + '|unpkg.*' + esc(n) + '|jsdelivr.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|' + slug(n), n + ' HTML marker'),
  ],
  css_tool: (n) => [
    p('script_src', esc(n) + '\\\\.js|postcss|sass|less|stylus|' + esc(n), n + ' script'),
    p('html', 'data-styled|css modules|' + esc(n), n + ' CSS tool marker'),
    p('css_content', '@import.*' + esc(n) + '|@use.*' + esc(n), n + ' CSS import'),
  ],
  dnd_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'draggable|sortable|dnd|drag-and-drop|dropzone|' + esc(n), n + ' DnD markers'),
  ],
  swiper_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|swiper|carousel|slider|' + esc(n), n + ' script'),
    p('html', 'swiper-slide|carousel-item|slider-item|slick-slide|flickity|splide|glide|embla|' + esc(n), n + ' carousel markers'),
    p('css_class', 'swiper|carousel|slider|slick|flickity|splide|glide|embla|' + slug(n).substring(0, 8), n + ' carousel CSS'),
  ],
  modal_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'modal|dialog|overlay|popup|lightbox|' + esc(n), n + ' modal markers'),
  ],
  toast_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'toast|notification|snackbar|alert|' + esc(n), n + ' toast markers'),
  ],
  date_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'datepicker|calendar|flatpickr|pikaday|tempus-dominus|' + esc(n), n + ' date markers'),
    p('browser_var', slug(n).substring(0, 12), n + ' global'),
  ],
  markdown_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'markdown|marked|showdown|remarkable|remark|unified|mdast|' + esc(n), n + ' markdown markers'),
  ],
  highlight_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|highlight|prism|shiki|' + esc(n), n + ' script'),
    p('html', 'hljs|prism-|shiki|highlightjs|highlightjs|syntax|code-block|' + esc(n), n + ' highlight markers'),
  ],
  pdf_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|pdf|jspdf|pdfmake|' + esc(n), n + ' script'),
    p('html', 'pdf|jspdf|pdfmake|html2canvas|' + esc(n), n + ' PDF markers'),
  ],
  upload_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|upload|dropzone|filepond|' + esc(n), n + ' script'),
    p('html', 'dropzone|filepond|upload|file-input|drag-over|' + esc(n), n + ' upload markers'),
  ],
  table_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|ag-grid|tabulator|handsontable|' + esc(n), n + ' script'),
    p('html', 'ag-grid|tabulator|handsontable|data-table|datatable|' + esc(n), n + ' table markers'),
    p('css_class', 'ag-|tabulator|ht_|handsontable|data-table|' + slug(n).substring(0, 8), n + ' table CSS'),
  ],
  select_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'select|autocomplete|combobox|dropdown|choices|tom-select|slim-select|' + esc(n), n + ' select markers'),
  ],
  map_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|mapbox|leaflet|openlayers|' + esc(n), n + ' map script'),
    p('html', 'mapboxgl|L\\.map|ol\\.|leaflet|openlayers|maplibre|' + esc(n), n + ' map markers'),
    p('browser_var', 'mapboxgl|L|ol|maplibregl', n + ' map global'),
  ],
  webgl_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|three|babylon|pixi|' + esc(n), n + ' script'),
    p('html', 'WebGL|THREE\\.|BABYLON\\.|PIXI\\.|canvas|renderer|' + esc(n), n + ' WebGL markers'),
    p('browser_var', 'THREE|BABYLON|PIXI|AFRAME', n + ' WebGL global'),
  ],
  video_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|video\\.js|plyr|jwplayer|flowplayer|' + esc(n), n + ' script'),
    p('html', 'videojs|plyr|jwplayer|flowplayer|hls\\.js|dash\\.js|shaka|' + esc(n), n + ' video markers'),
  ],
  audio_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|howler|tone|wavesurfer|' + esc(n), n + ' script'),
    p('html', 'Howler|Tone\\.|WaveSurfer|AudioContext|' + esc(n), n + ' audio markers'),
  ],
  lazy_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|lazyload|lozad|' + esc(n), n + ' script'),
    p('html', 'loading="lazy"|lazyload|lozad|data-src|' + esc(n), n + ' lazy markers'),
  ],
  virtual_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|virtual|react-window|react-virtualized|' + esc(n), n + ' script'),
    p('html', 'virtual|react-window|react-virtualized|virtual-scroll|' + esc(n), n + ' virtual markers'),
  ],
  accordion_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'accordion|collapse|collapsible|expand|toggle|' + esc(n), n + ' accordion markers'),
    p('css_class', 'accordion|collapse|collapsible|' + slug(n).substring(0, 8), n + ' accordion CSS'),
  ],
  tab_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'tab-pane|tab-content|nav-tab|tab-item|' + esc(n), n + ' tab markers'),
    p('css_class', 'tab-pane|nav-tab|tab-item|' + slug(n).substring(0, 8), n + ' tab CSS'),
  ],
  tooltip_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|tippy|popper|tooltip|' + esc(n), n + ' script'),
    p('html', 'tippy|popper|tooltip|data-tooltip|data-tippy|' + esc(n), n + ' tooltip markers'),
  ],
  validation_lib: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'data-validate|data-rules|form-validation|validate|' + esc(n), n + ' validation markers'),
  ],
  fw_component: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|' + slug(n).substring(0, 12), n + ' component markers'),
    p('css_class', slug(n).substring(0, 10), n + ' component CSS'),
  ],
  server_fw: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' server header'),
    p('html', esc(n) + '|' + slug(n), n + ' server marker'),
    p('path_probe', 'route|endpoint|api|' + esc(n), n + ' path probe'),
  ],
  php_fw: (n) => [
    p('meta_generator', esc(n), n + ' meta generator'),
    p('html', esc(n) + '|' + slug(n), n + ' PHP marker'),
    p('cookie', esc(n).toLowerCase(), n + ' cookie'),
    p('path_probe', 'index\\.php|' + esc(n), n + ' path probe'),
    p('header', 'x-powered-by', 'PHP', n + ' PHP header'),
  ],
  python_fw: (n) => [
    p('header', 'x-powered-by', 'Python|Django|Flask|' + esc(n), n + ' Python header'),
    p('html', esc(n) + '|' + slug(n), n + ' Python marker'),
    p('path_probe', 'csrfmiddlewaretoken|_token|' + esc(n), n + ' path probe'),
  ],
  ruby_fw: (n) => [
    p('header', 'x-powered-by', 'Ruby|Phusion Passenger|' + esc(n), n + ' Ruby header'),
    p('html', esc(n) + '|csrf-token|authenticity_token|' + slug(n), n + ' Ruby marker'),
    p('cookie', '_session|_csrf_token|' + esc(n).toLowerCase(), n + ' Ruby cookie'),
  ],
  java_fw: (n) => [
    p('header', 'x-powered-by', 'Servlet|JSP|Java|' + esc(n), n + ' Java header'),
    p('html', esc(n) + '|' + slug(n), n + ' Java marker'),
    p('path_probe', '\\.jsp|\\.do|\\.action|' + esc(n), n + ' path probe'),
  ],
  dotnet_fw: (n) => [
    p('header', 'x-powered-by', 'ASP\\.NET|IIS|' + esc(n), n + ' .NET header'),
    p('html', '__VIEWSTATE|__VIEWSTATEGENERATOR|__EVENTVALIDATION|asp-|' + esc(n), n + ' .NET markers'),
    p('cookie', 'ASP\\.NET_SessionId|\\.aspxauth|' + esc(n).toLowerCase(), n + ' .NET cookie'),
    p('path_probe', '\\.aspx|\\.ashx|\\.asmx|' + esc(n), n + ' path probe'),
  ],
  go_fw: (n) => [
    p('header', 'x-powered-by', 'Go|gin|echo|fiber|chi|' + esc(n), n + ' Go header'),
    p('html', esc(n) + '|' + slug(n), n + ' Go marker'),
    p('path_probe', esc(n), n + ' path probe'),
  ],
  rust_fw: (n) => [
    p('header', 'x-powered-by', 'Rocket|Actix|Axum|Warp|' + esc(n), n + ' Rust header'),
    p('html', esc(n) + '|' + slug(n), n + ' Rust marker'),
    p('path_probe', esc(n), n + ' path probe'),
  ],
  elixir_fw: (n) => [
    p('header', 'x-powered-by', 'Phoenix|Plug|' + esc(n), n + ' Elixir header'),
    p('html', esc(n) + '|phx-|' + slug(n), n + ' Elixir marker'),
    p('cookie', '_web_key|_csrf_token|' + esc(n).toLowerCase(), n + ' Elixir cookie'),
  ],
  database: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' header'),
    p('html', esc(n) + '|' + slug(n), n + ' DB marker'),
    p('path_probe', esc(n) + '|\\/admin|\\/status|\\/metrics', n + ' path probe'),
  ],
  orm: (n) => [
    p('script_src', esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|prisma|sequelize|typeorm|knex|mongoose|drizzle|' + slug(n), n + ' ORM markers'),
  ],
  search_engine: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' header'),
    p('html', 'elasticsearch|solr|' + esc(n) + '|' + slug(n), n + ' search marker'),
    p('path_probe', '\\/_search|\\/api\\/search|\\/query|' + esc(n), n + ' path probe'),
  ],
  cache: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' header'),
    p('html', esc(n) + '|' + slug(n), n + ' cache marker'),
    p('path_probe', '\\/stats|\\/info|' + esc(n), n + ' path probe'),
  ],
  message_queue: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' header'),
    p('html', esc(n) + '|' + slug(n), n + ' MQ marker'),
    p('path_probe', '\\/api\\/queue|\\/channels|' + esc(n), n + ' path probe'),
  ],
  email_service: (n) => [
    p('header', 'x-email-service', esc(n), n + ' email header'),
    p('html', esc(n) + '|email-sent|sendgrid|ses|mailgun|' + slug(n), n + ' email marker'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, ''), n + ' email cookie'),
  ],
  auth_server: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' auth header'),
    p('html', 'oauth|oidc|saml|jwt|token|' + esc(n), n + ' auth markers'),
    p('cookie', 'session|jwt|token|auth|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, ''), n + ' auth cookie'),
    p('path_probe', '\\/auth|\\/oauth|\\/login|\\/callback|' + esc(n), n + ' auth path'),
  ],
  api_protocol: (n) => [
    p('header', 'content-type', 'application\\/json|application\\/graphql|application\\/grpc|' + esc(n), n + ' API header'),
    p('html', 'graphql|grpc|rest|api|' + esc(n), n + ' API marker'),
  ],
  template_engine: (n) => [
    p('html', esc(n) + '|<%|<%=|{{|\\{\\{|ejs|handlebars|pug|nunjucks|' + slug(n), n + ' template markers'),
    p('path_probe', '\\.ejs|\\.hbs|\\.pug|\\.njk|\\.mustache|' + esc(n), n + ' template path'),
  ],
  logging: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' logging header'),
    p('html', esc(n) + '|console\\.|log\\(|error\\(|warn\\(|' + slug(n), n + ' logging marker'),
  ],
  error_tracking: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'Sentry|Rollbar|Bugsnag|Airbrake|LogRocket|ErrorBoundary|' + esc(n), n + ' error tracking markers'),
    p('cookie', '_sentry|_rollbar|_bugsnag|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, ''), n + ' error cookie'),
  ],
  file_storage: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' storage header'),
    p('html', 's3|gcs|azure-blob|' + esc(n) + '|' + slug(n), n + ' storage marker'),
    p('path_probe', '\\/uploads|\\/files|\\/objects|' + esc(n), n + ' storage path'),
  ],
  payment_processor: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|checkout|payment|stripe|paypal|' + esc(n), n + ' payment script'),
    p('html', 'stripe|paypal|checkout|payment|braintree|adyen|mollie|' + esc(n), n + ' payment markers'),
    p('cookie', '_stripe|_paypal|_checkout|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, ''), n + ' payment cookie'),
  ],
  webhook_service: (n) => [
    p('header', 'x-webhook|webhook-id|webhook-signature|' + esc(n), n + ' webhook header'),
    p('html', esc(n) + '|webhook|callback|payload', n + ' webhook marker'),
  ],
  saas_tool: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', esc(n) + '|' + slug(n), n + ' SaaS marker'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' SaaS cookie'),
  ],
  crm: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'crm|customer|lead|pipeline|deal|opportunity|' + esc(n), n + ' CRM markers'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' CRM cookie'),
  ],
  lms: (n) => [
    p('meta_generator', esc(n), n + ' LMS generator'),
    p('html', 'course|lesson|quiz|enrollment|moodle|canvas|blackboard|' + esc(n), n + ' LMS markers'),
    p('path_probe', 'course|lesson|quiz|mod|' + esc(n), n + ' LMS path'),
  ],
  forum: (n) => [
    p('meta_generator', esc(n), n + ' forum generator'),
    p('html', 'thread|post|reply|topic|forum|discourse|' + esc(n), n + ' forum markers'),
    p('path_probe', 'topic|thread|post|reply|' + esc(n), n + ' forum path'),
  ],
  wiki: (n) => [
    p('meta_generator', esc(n), n + ' wiki generator'),
    p('html', 'wiki|page|revision|edit|history|' + esc(n), n + ' wiki markers'),
    p('path_probe', 'wiki|page|index|' + esc(n), n + ' wiki path'),
  ],
  project_mgmt: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'task|issue|sprint|backlog|kanban|gantt|project|' + esc(n), n + ' project mgmt markers'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' PM cookie'),
  ],
  helpdesk: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'ticket|support|helpdesk|customer-service|' + esc(n), n + ' helpdesk markers'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' helpdesk cookie'),
  ],
  ecommerce: (n) => [
    p('meta_generator', esc(n), n + ' e-commerce generator'),
    p('html', 'cart|checkout|product|shop|woocommerce|magento|shopify|' + esc(n), n + ' e-commerce markers'),
    p('cookie', 'cart|woocommerce_|shopify_|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' e-commerce cookie'),
    p('path_probe', 'cart|checkout|product|shop|account|' + esc(n), n + ' e-commerce path'),
    p('header', 'x-powered-by', esc(n), n + ' e-commerce header'),
  ],
  cms: (n) => [
    p('meta_generator', esc(n), n + ' CMS generator'),
    p('html', 'wp-content|wp-admin|drupal|joomla|squarespace|wix|webflow|ghost|' + esc(n), n + ' CMS markers'),
    p('cookie', 'wordpress_|drupal_|squarespace_|wix_|ghost-' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' CMS cookie'),
    p('path_probe', 'wp-admin|wp-login|wp-content|admin|' + esc(n), n + ' CMS path'),
    p('header', 'x-powered-by', esc(n), n + ' CMS header'),
  ],
  headless_cms: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' headless CMS header'),
    p('html', 'contentful|strapi|sanity|prismic|directus|payload|' + esc(n), n + ' headless CMS markers'),
    p('path_probe', '\\/api\\/|content|graphql|' + esc(n), n + ' headless CMS path'),
  ],
  analytics_platform: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|analytics|gtag|ga\\(|_gaq|' + esc(n), n + ' analytics script'),
    p('html', 'analytics|gtag|_gaq|ga\\(|fbq|pixel|track|' + esc(n), n + ' analytics markers'),
    p('cookie', '_ga|_gid|_gat|_fbp|_fbc|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' analytics cookie'),
  ],
  marketing_tool: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'marketing|campaign|lead|magnet|funnel|' + esc(n), n + ' marketing markers'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' marketing cookie'),
  ],
  tag_manager: (n) => [
    p('script_src', esc(n) + '\\\\.js|gtm\\.js|tagmanager|' + esc(n), n + ' tag script'),
    p('html', 'gtm\\.js|tagmanager|dataLayer|gtm-container|' + esc(n), n + ' tag markers'),
  ],
  ab_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'experiment|variant|split-test|ab-test|optimizely|' + esc(n), n + ' A/B markers'),
    p('cookie', 'optimizely|vwo|ab|variant|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' A/B cookie'),
  ],
  session_recording: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'session|recording|rrweb|fullstory|logrocket|' + esc(n), n + ' session recording markers'),
    p('cookie', esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' session cookie'),
  ],
  heatmap: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'heatmap|click|scroll|mouse|hotjar|crazyegg|' + esc(n), n + ' heatmap markers'),
    p('cookie', '_hj|_ce|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' heatmap cookie'),
  ],
  feedback_tool: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'survey|feedback|nps|csat|form|poll|typeform|' + esc(n), n + ' feedback markers'),
  ],
  live_chat: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n) + '|chat-widget|livechat', n + ' script'),
    p('html', 'chat|widget|intercom|drift|crisp|tawk|zendesk|' + esc(n), n + ' chat markers'),
    p('cookie', 'intercom|drift|crisp|tawk|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' chat cookie'),
  ],
  chatbot: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'chatbot|bot|ai-chat|assistant|' + esc(n), n + ' chatbot markers'),
  ],
  captcha: (n) => [
    p('script_src', esc(n) + '\\\\.js|recaptcha|hcaptcha|turnstile|captcha|' + esc(n), n + ' captcha script'),
    p('html', 'g-recaptcha|h-captcha|cf-turnstile|captcha|' + esc(n), n + ' captcha markers'),
  ],
  cookie_consent: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'cookie-consent|cookie-banner|cookie-notice|gdpr|ccpa|consent|' + esc(n), n + ' consent markers'),
  ],
  privacy_tool: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'privacy|gdpr|ccpa|consent|opt-out|do-not-track|' + esc(n), n + ' privacy markers'),
  ],
  form_builder: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'form|submit|field|input|typeform|jotform|' + esc(n), n + ' form builder markers'),
    p('meta_generator', esc(n), n + ' form builder generator'),
  ],
  newsletter: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'newsletter|subscribe|email-signup|mailing-list|' + esc(n), n + ' newsletter markers'),
  ],
  booking: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'booking|reservation|appointment|calendar|schedule|' + esc(n), n + ' booking markers'),
  ],
  invoice: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'invoice|billing|payment|subscription|' + esc(n), n + ' billing markers'),
  ],
  esignature: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'signature|sign|e-sign|docusign|hellosign|' + esc(n), n + ' e-signature markers'),
  ],
  doc_platform: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'documentation|docs|api-reference|swagger|redoc|' + esc(n), n + ' docs markers'),
    p('meta_generator', esc(n), n + ' docs generator'),
  ],
  status_page: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'status|uptime|incident|maintenance|degraded|' + esc(n), n + ' status markers'),
  ],
  changelog: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'changelog|release|version|update|' + esc(n), n + ' changelog markers'),
  ],
  design_tool: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'design|prototype|wireframe|mockup|figma|sketch|' + esc(n), n + ' design markers'),
  ],
  font_service: (n) => [
    p('link_tag', 'fonts\\.googleapis|typekit|fonts\\.adobe|font-face|' + esc(n) + '.*font|font.*' + esc(n), n + ' font link'),
    p('html', 'font-face|font-family|google-fonts|typekit|' + esc(n), n + ' font markers'),
  ],
  video_hosting: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|player|video|embed|' + esc(n), n + ' video script'),
    p('html', 'iframe.*video|video-player|embed|youtube|vimeo|wistia|brightcove|' + esc(n), n + ' video markers'),
  ],
  image_service: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' image service header'),
    p('html', 'cloudinary|imgix|imagekit|' + esc(n), n + ' image service markers'),
    p('html', 'srcset|responsive-image|art-direction|' + esc(n), n + ' responsive image'),
  ],
  translation_service: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'translate|i18n|localization|locale|lang|' + esc(n), n + ' translation markers'),
  ],
  voice_service: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'voice|speech|stt|tts|recognition|whisper|' + esc(n), n + ' voice markers'),
  ],
  sms_service: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' SMS header'),
    p('html', 'twilio|sms|messaging|' + esc(n), n + ' SMS markers'),
  ],
  push_notification: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|firebase-messaging|onesignal|' + esc(n), n + ' push script'),
    p('html', 'push-notification|service-worker|firebase-messaging|onesignal|' + esc(n), n + ' push markers'),
  ],
  iot_platform: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' IoT header'),
    p('html', 'mqtt|iot|device|sensor|' + esc(n), n + ' IoT markers'),
  ],
  blockchain: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|web3|ethers|viem|wagmi|' + esc(n), n + ' blockchain script'),
    p('html', 'web3|ethereum|blockchain|wallet|connect|metaMask|' + esc(n), n + ' blockchain markers'),
    p('browser_var', 'ethereum|web3|window\\.ethereum', n + ' blockchain global'),
  ],
  crypto_service: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'crypto|bitcoin|ethereum|wallet|' + esc(n), n + ' crypto markers'),
  ],
  map_service: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|mapbox|google.*maps|leaflet|' + esc(n), n + ' map script'),
    p('html', 'mapbox|google.*maps|leaflet|openlayers|maplibre|' + esc(n), n + ' map markers'),
    p('browser_var', 'mapboxgl|google\\.maps|L|ol', n + ' map global'),
  ],
  weather_service: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'weather|forecast|temperature|climate|' + esc(n), n + ' weather markers'),
  ],
  data_catalog: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'catalog|metadata|schema|lineage|' + esc(n), n + ' data catalog markers'),
  ],
  business_intelligence: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'dashboard|report|visualization|kpi|metric|' + esc(n), n + ' BI markers'),
  ],
  onboarding: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'onboarding|welcome|tutorial|walkthrough|tour|' + esc(n), n + ' onboarding markers'),
  ],
  user_research: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'research|usability|test|prototype|interview|' + esc(n), n + ' research markers'),
  ],
  cdn_service: (n) => [
    p('header', 'x-powered-by|cf-ray|server', esc(n) + '|cloudflare|akamai|fastly|cloudfront', n + ' CDN header'),
    p('html', esc(n) + '|' + slug(n), n + ' CDN marker'),
  ],
  hosting_platform: (n) => [
    p('header', 'x-powered-by|x-vercel|x-netlify|x-github|server', esc(n) + '|vercel|netlify|github', n + ' hosting header'),
    p('html', 'vercel|netlify|github-pages|gitlab-pages|' + esc(n), n + ' hosting marker'),
  ],
  cloud_platform: (n) => [
    p('header', 'x-amz|x-azure|x-goog|x-powered-by', esc(n) + '|aws|azure|gcp', n + ' cloud header'),
    p('html', 'aws|azure|gcp|google-cloud|' + esc(n), n + ' cloud marker'),
  ],
  container_tool: (n) => [
    p('header', 'x-powered-by|server', esc(n) + '|docker|kubernetes', n + ' container header'),
    p('html', 'docker|kubernetes|k8s|container|' + esc(n), n + ' container marker'),
  ],
  ci_cd: (n) => [
    p('header', 'x-powered-by|server', esc(n) + '|github-actions|gitlab-ci|jenkins', n + ' CI/CD header'),
    p('html', 'ci\\/cd|pipeline|build|deploy|github-actions|jenkins|' + esc(n), n + ' CI/CD marker'),
  ],
  monitoring: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n) + '|rum|real-user', n + ' script'),
    p('html', 'monitoring|apm|rum|real-user|telemetry|' + esc(n), n + ' monitoring markers'),
    p('header', 'x-powered-by', esc(n), n + ' monitoring header'),
  ],
  security_tool: (n) => [
    p('header', 'strict-transport-security|x-frame-options|x-content-type|content-security-policy|' + esc(n), n + ' security header'),
    p('html', esc(n) + '|security|waf|firewall|vulnerability', n + ' security marker'),
  ],
  dns_provider: (n) => [
    p('header', 'server|cf-ray|x-powered-by', esc(n) + '|cloudflare|route53|ns1|dyn|' + slug(n), n + ' DNS header'),
    p('html', 'dns|nameserver|' + esc(n), n + ' DNS marker'),
  ],
  ssl_provider: (n) => [
    p('header', 'strict-transport-security|expect-ct|x-powered-by', esc(n) + '|letsencrypt|digicert|comodo', n + ' SSL header'),
    p('html', 'ssl|tls|certificate|letsencrypt|' + esc(n), n + ' SSL marker'),
  ],
  waf: (n) => [
    p('header', 'x-sucuri|x-akamai|x-cdn|x-waf|cf-', esc(n) + '|sucuri|akamai|cloudflare|incapsula|imperva', n + ' WAF header'),
    p('html', 'waf|firewall|security|protection|' + esc(n), n + ' WAF marker'),
  ],
  load_balancer: (n) => [
    p('header', 'x-amz-cf-id|x-forwarded|x-real-ip|x-balancer|server', esc(n) + '|elb|alb|nlb|haproxy|nginx', n + ' LB header'),
    p('html', 'load-balancer|health-check|upstream|' + esc(n), n + ' LB marker'),
  ],
  reverse_proxy: (n) => [
    p('header', 'server|x-powered-by|x-proxy|via', esc(n) + '|nginx|caddy|traefik|envoy|haproxy', n + ' reverse proxy header'),
    p('html', 'nginx|caddy|traefik|envoy|haproxy|' + esc(n), n + ' proxy marker'),
  ],
  object_storage: (n) => [
    p('header', 'x-amz|x-ms|content-type', esc(n) + '|s3|gcs|azure-blob', n + ' storage header'),
    p('html', 's3|gcs|azure-blob|upload|file|' + esc(n), n + ' storage marker'),
  ],
  backup_service: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' backup header'),
    p('html', 'backup|restore|snapshot|recovery|' + esc(n), n + ' backup marker'),
  ],
  disaster_recovery: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' DR header'),
    p('html', 'disaster-recovery|failover|backup|redundancy|' + esc(n), n + ' DR marker'),
  ],
  network_monitoring: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' network monitoring header'),
    p('html', 'network|bandwidth|latency|packet|snmp|' + esc(n), n + ' network monitoring'),
  ],
  vulnerability_scanner: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' vuln scanner header'),
    p('html', 'vulnerability|scan|cve|exploit|pentest|' + esc(n), n + ' vuln scanner'),
  ],
  compliance_tool: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' compliance header'),
    p('html', 'compliance|audit|regulation|hipaa|soc2|pci|' + esc(n), n + ' compliance marker'),
  ],
  incident_management: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'incident|postmortem|oncall|pager|alert|' + esc(n), n + ' incident markers'),
  ],
  on_call: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'oncall|on-call|pager|escalation|rotation|' + esc(n), n + ' on-call markers'),
  ],
  feature_flags: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'feature-flag|feature-toggle|launchdarkly|split|unleash|flagsmith|' + esc(n), n + ' feature flag markers'),
  ],
  experimentation: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'experiment|variant|ab-test|optimizely|' + esc(n), n + ' experiment markers'),
    p('cookie', 'optimizely|variant|_ab|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' experiment cookie'),
  ],
  edge_runtime: (n) => [
    p('header', 'x-powered-by|x-edge|x-vercel|cf-worker', esc(n) + '|cloudflare|deno|vercel|fastly', n + ' edge header'),
    p('html', 'edge|worker|deno|cloudflare-workers|' + esc(n), n + ' edge marker'),
  ],
  serverless: (n) => [
    p('header', 'x-powered-by|x-amzn|cf-worker|x-vercel|server', esc(n) + '|lambda|lambda@edge|workers|functions', n + ' serverless header'),
    p('html', 'serverless|lambda|function|worker|' + esc(n), n + ' serverless marker'),
  ],
  container_registry: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' registry header'),
    p('html', 'registry|docker|container|image|' + esc(n), n + ' registry marker'),
  ],
  artifact_repository: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' artifact header'),
    p('html', 'artifact|package|repository|maven|npm|nuget|' + esc(n), n + ' artifact marker'),
  ],
  code_review: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' code review header'),
    p('html', 'review|pull-request|merge-request|diff|comment|' + esc(n), n + ' code review'),
  ],
  dependency_scanning: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'dependency|vulnerability|cve|snyk|dependabot|renovate|' + esc(n), n + ' dependency scan'),
  ],
  license_scanning: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'license|spdx|scancode|oss|open-source|' + esc(n), n + ' license scan'),
  ],
  performance_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'lighthouse|performance|benchmark|throttle|' + esc(n), n + ' performance test'),
  ],
  load_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'load-test|stress|k6|jmeter|gatling|locust|' + esc(n), n + ' load test'),
  ],
  browser_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'cypress|playwright|puppeteer|selenium|webdriver|' + esc(n), n + ' browser test'),
  ],
  visual_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'visual-test|screenshot|percy|chromatic|applitools|' + esc(n), n + ' visual test'),
  ],
  accessibility_testing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'a11y|accessibility|wcag|aria|screen-reader|axe|pa11y|' + esc(n), n + ' a11y test'),
  ],
  security_scanning: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'security-scan|vulnerability|pentest|owasp|' + esc(n), n + ' security scan'),
  ],
  static_analysis: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'static-analysis|lint|sonar|code-quality|' + esc(n), n + ' static analysis'),
  ],
  code_coverage: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'coverage|istanbul|nyc|lcov|codecov|coveralls|' + esc(n), n + ' code coverage'),
  ],
  profiling: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'profiling|flamegraph|pprof|perf|tracing|' + esc(n), n + ' profiling'),
  ],
  debugging: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'debug|breakpoint|console|devtools|inspector|' + esc(n), n + ' debugging'),
  ],
  localization: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'localization|l10n|i18n|locale|translation|' + esc(n), n + ' localization'),
  ],
  i18n_platform: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'i18n|locale|translation|crowdin| Lokalise| transifex|' + esc(n), n + ' i18n platform'),
  ],
  translation_memory: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'translation-memory|tm|glossary|termbase|' + esc(n), n + ' TM'),
  ],
  diagramming: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'diagram|flowchart|mermaid|graphviz|drawio|' + esc(n), n + ' diagram markers'),
  ],
  whiteboarding: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'whiteboard|canvas|draw|sketch|' + esc(n), n + ' whiteboard markers'),
  ],
  collaboration: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'collaborate|realtime|editing|cursor|' + esc(n), n + ' collaboration markers'),
  ],
  video_conferencing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'video-conference|meeting|webinar|zoom|teams|meet|' + esc(n), n + ' video conf markers'),
  ],
  screen_sharing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'screen-share|remote-desktop|screenshot|capture|' + esc(n), n + ' screen share'),
  ],
  digital_whiteboard: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'whiteboard|canvas|draw|board|miro|figma|' + esc(n), n + ' whiteboard'),
  ],
  knowledge_base: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'knowledge-base|wiki|docs|help-center|' + esc(n), n + ' KB markers'),
  ],
  document_management: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'document|file|folder|upload|share|' + esc(n), n + ' DMS markers'),
  ],
  workflow_automation: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'workflow|automation|trigger|action|zap|' + esc(n), n + ' workflow markers'),
  ],
  rpa: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'rpa|robot|automate|process|' + esc(n), n + ' RPA markers'),
  ],
  ipaas: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'integration|connector|sync|pipe|' + esc(n), n + ' iPaaS markers'),
  ],
  data_integration: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'data-integration|etl|pipeline|transform|' + esc(n), n + ' data integration'),
  ],
  api_management: (n) => [
    p('header', 'x-powered-by|api-version|x-rate|x-throttle', esc(n) + '|kong|tyk|apigee|aws-api', n + ' API mgmt header'),
    p('html', 'api-management|rate-limit|throttle|swagger|' + esc(n), n + ' API mgmt markers'),
  ],
  gateway: (n) => [
    p('header', 'x-powered-by|server|via', esc(n) + '|kong|tyk|envoy|nginx|api-gateway', n + ' gateway header'),
    p('html', 'gateway|proxy|upstream|route|' + esc(n), n + ' gateway markers'),
  ],
  service_mesh: (n) => [
    p('header', 'x-powered-by|x-envoy|server', esc(n) + '|istio|linkerd|consul', n + ' service mesh header'),
    p('html', 'istio|linkerd|consul-connect|service-mesh|' + esc(n), n + ' service mesh'),
  ],
  service_discovery: (n) => [
    p('header', 'x-powered-by', esc(n) + '|consul|etcd|zookeeper|eureka', n + ' discovery header'),
    p('html', 'service-discovery|registry|consul|etcd|zookeeper|eureka|' + esc(n), n + ' discovery'),
  ],
  consul: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' Consul header'),
    p('html', 'consul|service-mesh|kv-store|' + esc(n), n + ' Consul markers'),
    p('path_probe', '\\/v1\\/|\\/ui\\/|\\/status|' + esc(n), n + ' Consul path'),
  ],
  orchestration: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' orchestration header'),
    p('html', 'kubernetes|docker-swarm|nomad|ecs|' + esc(n), n + ' orchestration'),
  ],
  provisioning: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' provisioning header'),
    p('html', 'terraform|ansible|puppet|chef|' + esc(n), n + ' provisioning'),
  ],
  idempotent: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' IaC header'),
    p('html', 'infrastructure-as-code|terraform|cloudformation|cdk|' + esc(n), n + ' IaC markers'),
  ],
  gitops: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' GitOps header'),
    p('html', 'gitops|argo|flux|reconcile|sync|' + esc(n), n + ' GitOps'),
  ],
  policy_engine: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' policy header'),
    p('html', 'policy|rego|opa|kyverno|admission|' + esc(n), n + ' policy markers'),
  ],
  cost_management: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'cost|budget|spend|optimization|finops|' + esc(n), n + ' cost markers'),
  ],
  finops: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'finops|cost-optimization|cloud-cost|' + esc(n), n + ' FinOps markers'),
  ],
  resource_management: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'resource|capacity|allocation|quota|' + esc(n), n + ' resource markers'),
  ],
  capacity_planning: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'capacity|scaling|autoscaling|horizontal|vertical|' + esc(n), n + ' capacity markers'),
  ],
  chaos_engineering: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'chaos|fault|inject|resilience|blast-radius|' + esc(n), n + ' chaos markers'),
  ],
  observability: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'observability|traces|metrics|logs|telemetry|otel|opentelemetry|' + esc(n), n + ' observability'),
    p('header', 'x-powered-by', esc(n), n + ' observability header'),
  ],
  tracing: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'trace|span|jaeger|zipkin|opentelemetry|otel|' + esc(n), n + ' tracing markers'),
    p('header', 'traceparent|tracestate|baggage', esc(n), n + ' trace header'),
  ],
  metrics: (n) => [
    p('script_src', esc(n) + '\\\\.min\\.js|' + esc(n) + '\\\\.js|cdn.*' + esc(n), n + ' script'),
    p('html', 'metrics|prometheus|grafana|datadog|counter|histogram|gauge|' + esc(n), n + ' metrics'),
  ],
  log_aggregation: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' log agg header'),
    p('html', 'logging|log-aggregation|elk|loki|splunk|graylog|' + esc(n), n + ' log aggregation'),
  ],
  siem: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' SIEM header'),
    p('html', 'siem|security-information|event-management|correlation|' + esc(n), n + ' SIEM'),
  ],
  soar: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' SOAR header'),
    p('html', 'soar|orchestration|automation|response|playbook|' + esc(n), n + ' SOAR'),
  ],
  edr: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' EDR header'),
    p('html', 'edr|endpoint-detection|response|crowdstrike|sentinelone|carbon-black|' + esc(n), n + ' EDR'),
  ],
  xdr: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' XDR header'),
    p('html', 'xdr|extended-detection|correlation|cross-domain|' + esc(n), n + ' XDR'),
  ],
  dlp: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' DLP header'),
    p('html', 'dlp|data-loss|prevention|classification|' + esc(n), n + ' DLP'),
  ],
  zero_trust: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' Zero Trust header'),
    p('html', 'zero-trust|never-trust|verify|identity|' + esc(n), n + ' Zero Trust'),
  ],
  identity_provider: (n) => [
    p('header', 'x-powered-by|set-cookie', esc(n) + '|auth0|okta|azure-ad', n + ' IdP header'),
    p('html', 'oauth|oidc|saml|identity|auth|login|' + esc(n), n + ' IdP markers'),
    p('cookie', 'session|token|auth|auth0|okta|' + esc(n).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20), n + ' IdP cookie'),
    p('path_probe', '\\/auth|\\/oauth|\\/saml|\\/oidc|\\/login|' + esc(n), n + ' IdP path'),
  ],
  directory_service: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' directory header'),
    p('html', 'ldap|active-directory|directory|user-store|' + esc(n), n + ' directory'),
  ],
  pki: (n) => [
    p('header', 'x-powered-by|x-pki|certificate', esc(n), n + ' PKI header'),
    p('html', 'certificate|pki|ca|certificate-authority|' + esc(n), n + ' PKI'),
  ],
  hsm: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' HSM header'),
    p('html', 'hsm|hardware-security|key-management|' + esc(n), n + ' HSM'),
  ],
  key_management: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' KMS header'),
    p('html', 'key-management|kms|encryption-key|' + esc(n), n + ' KMS'),
  ],
  vault: (n) => [
    p('header', 'x-powered-by|x-vault', esc(n) + '|vault', n + ' Vault header'),
    p('html', 'vault|secret|token|seal|unseal|' + esc(n), n + ' Vault markers'),
    p('path_probe', '\\/v1\\/|\\/sys\\/|\\/secret\\/|' + esc(n), n + ' Vault path'),
  ],
  data_warehouse: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' DW header'),
    p('html', 'data-warehouse|snowflake|bigquery|redshift|synapse|databricks|' + esc(n), n + ' DW'),
  ],
  etl_tool: (n) => [
    p('header', 'x-powered-by', esc(n), n + ' ETL header'),
    p('html', 'etl|transform|pipeline|airflow|dagster|prefect|' + esc(n), n + ' ETL'),
  ],
};

// Category type mapping
const CAT_TYPES = {};

function getCatType(cat, typeKey) {
  const lower = (cat + ' ' + typeKey).toLowerCase();
  if (lower.includes('server') || lower.includes('php_fw') || lower.includes('python_fw') || lower.includes('ruby_fw') ||
      lower.includes('java_fw') || lower.includes('dotnet_fw') || lower.includes('go_fw') || lower.includes('rust_fw') ||
      lower.includes('elixir_fw') || lower.includes('database') || lower.includes('orm') || lower.includes('cache') ||
      lower.includes('message_queue') || lower.includes('email') || lower.includes('auth') || lower.includes('api_protocol') ||
      lower.includes('template_engine') || lower.includes('file_storage') || lower.includes('search_engine') ||
      lower.includes('cms') || lower.includes('ecommerce') || lower.includes('lms') || lower.includes('forum') ||
      lower.includes('wiki') || lower.includes('project_mgmt') || lower.includes('helpdesk') || lower.includes('saas') ||
      lower.includes('crm') || lower.includes('newsletter') || lower.includes('invoice') || lower.includes('esignature') ||
      lower.includes('changelog') || lower.includes('doc_platform') || lower.includes('design_tool') ||
      lower.includes('video_hosting') || lower.includes('chatbot') || lower.includes('live_chat') ||
      lower.includes('marketing') || lower.includes('seo') || lower.includes('social') || lower.includes('email_marketing') ||
      lower.includes('blockchain') || lower.includes('crypto') || lower.includes('iot') || lower.includes('voice') ||
      lower.includes('sms') || lower.includes('translation_service') || lower.includes('image_service') ||
      lower.includes('form_builder') || lower.includes('booking') || lower.includes('feedback') ||
      lower.includes('data_catalog') || lower.includes('business_intel') || lower.includes('onboarding') ||
      lower.includes('user_research') || lower.includes('webhook') || lower.includes('status_page') ||
      lower.includes('privacy') || lower.includes('ab_testing') || lower.includes('session_recording') ||
      lower.includes('heatmap') || lower.includes('tag_manager') || lower.includes('analytics_platform') ||
      lower.includes('ad_network') || lower.includes('affiliate') || lower.includes('cookie_consent') ||
      lower.includes('captcha') || lower.includes('payment')) {
    return 'backend';
  }
  if (lower.includes('infra') || lower.includes('cdn') || lower.includes('hosting') || lower.includes('cloud') ||
      lower.includes('container') || lower.includes('ci_cd') || lower.includes('monitoring') || lower.includes('security') ||
      lower.includes('dns') || lower.includes('ssl') || lower.includes('waf') || lower.includes('logging') ||
      lower.includes('load_balancer') || lower.includes('reverse_proxy') || lower.includes('object_storage') ||
      lower.includes('backup') || lower.includes('disaster') || lower.includes('network_monitor') ||
      lower.includes('vulnerability') || lower.includes('compliance') || lower.includes('secret') ||
      lower.includes('config') || lower.includes('edge') || lower.includes('serverless') || lower.includes('registry') ||
      lower.includes('code_review') || lower.includes('dependency') || lower.includes('license') ||
      lower.includes('performance_testing') || lower.includes('load_testing') || lower.includes('browser_testing') ||
      lower.includes('visual_testing') || lower.includes('accessibility_testing') || lower.includes('security_scanning') ||
      lower.includes('static_analysis') || lower.includes('code_coverage') || lower.includes('profiling') ||
      lower.includes('debugging') || lower.includes('data_warehouse') || lower.includes('etl') ||
      lower.includes('siem') || lower.includes('soar') || lower.includes('edr') || lower.includes('xdr') ||
      lower.includes('dlp') || lower.includes('zero_trust') || lower.includes('identity_provider') ||
      lower.includes('directory') || lower.includes('pki') || lower.includes('hsm') || lower.includes('key_management') ||
      lower.includes('vault') || lower.includes('observability') || lower.includes('tracing') || lower.includes('metrics') ||
      lower.includes('log_aggregation') || lower.includes('gitops') || lower.includes('policy') ||
      lower.includes('cost_management') || lower.includes('finops') || lower.includes('resource_management') ||
      lower.includes('capacity') || lower.includes('chaos') || lower.includes('incident') || lower.includes('on_call') ||
      lower.includes('feature_flags') || lower.includes('experimentation') || lower.includes('container_registry') ||
      lower.includes('artifact') || lower.includes('service_mesh') || lower.includes('service_discovery') ||
      lower.includes('orchestration') || lower.includes('provisioning') || lower.includes('idempotent') ||
      lower.includes('gateway') || lower.includes('api_management') || lower.includes('data_integration') ||
      lower.includes('ipaas') || lower.includes('rpa') || lower.includes('workflow_automation') ||
      lower.includes('diagramming') || lower.includes('whiteboarding') || lower.includes('collaboration') ||
      lower.includes('video_conferencing') || lower.includes('screen_sharing') || lower.includes('digital_whiteboard') ||
      lower.includes('knowledge_base') || lower.includes('document_management') || lower.includes('localization') ||
      lower.includes('i18n_platform') || lower.includes('translation_memory') || lower.includes('consul')) {
    return 'infra';
  }
  return 'frontend';
}

// Main generation
const dataFiles = ['data-fe.js', 'data-be.js', 'data-infra.js', 'data-content.js'];
let allEntries = [];

for (const file of dataFiles) {
  const fp = path.join(__dirname, file);
  if (fs.existsSync(fp)) {
    const entries = require(fp);
    console.log(`${file}: ${entries.length} entries`);
    allEntries = allEntries.concat(entries);
  }
}

console.log(`Total entries: ${allEntries.length}`);

// Deduplicate by name+category
const seen = new Set();
const unique = [];
for (const entry of allEntries) {
  const key = entry[0] + '|' + entry[1];
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(entry);
  }
}
console.log(`Unique entries: ${unique.length}`);

// Generate rules
const rules = [];
const categorySet = new Set();
let skipped = 0;

for (const [name, category, typeKey] of unique) {
  if (!name || !category || !typeKey) { skipped++; continue; }
  const fn = TEMPLATES[typeKey];
  if (!fn) { skipped++; continue; }

  try {
    const patterns = fn(name);
    if (patterns && patterns.length > 0) {
      rules.push({ name, category, patterns });
      categorySet.add(category);
    }
  } catch (e) {
    skipped++;
  }
}

console.log(`Rules generated: ${rules.length}`);
console.log(`Categories: ${categorySet.size}`);
console.log(`Skipped: ${skipped}`);

// Write rules output
// Write rules output as JSON (much smaller than inline JS, webpack can handle it)
const rulesJson = JSON.stringify(rules);
fs.writeFileSync(path.join(__dirname, '_generated_rules.json'), rulesJson, 'utf8');
console.log(`Rules written to _generated_rules.json (${rulesJson.length} bytes)`);

// Generate CATEGORY_TYPES entries
const catTypeLines = [];
for (const cat of [...categorySet].sort()) {
  const type = getCatType(cat, '');
  catTypeLines.push(`  '${cat}': '${type}',`);
}
const catTypesText = catTypeLines.join('\n');
fs.writeFileSync(path.join(__dirname, '_generated_categories.js'), catTypesText, 'utf8');
console.log(`Categories written to _generated_categories.js`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total rules: ${rules.length}`);
console.log(`Total categories: ${categorySet.size}`);

// Count by type
const typeCounts = {};
for (const [, , typeKey] of unique) {
  typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
}
const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
console.log('\nTop typeKeys:');
for (const [k, v] of sorted.slice(0, 20)) {
  console.log(`  ${k}: ${v}`);
}
