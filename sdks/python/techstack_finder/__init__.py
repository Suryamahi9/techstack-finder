"""TechStack Finder Python SDK — scan any website's technology stack."""

import requests
from dataclasses import dataclass
from typing import Optional, List, Dict, Any


@dataclass
class TechStackResult:
    """Result from a TechStack Finder scan."""
    domain: str
    url: str
    title: str
    favicon: str
    scanned_at: str
    health_score: int
    total_techs: int
    categories: List[Dict[str, Any]]
    technologies: List[Dict[str, Any]]
    summary: Dict[str, Any]
    raw: Dict[str, Any]

    @classmethod
    def from_api(cls, data: Dict[str, Any]) -> "TechStackResult":
        site = data.get("site", {})
        return cls(
            domain=site.get("domain", ""),
            url=site.get("url", ""),
            title=site.get("title", ""),
            favicon=site.get("favicon", ""),
            scanned_at=site.get("scannedAt", ""),
            health_score=data.get("healthScore", 0),
            total_techs=data.get("summary", {}).get("total", 0),
            categories=data.get("categories", []),
            technologies=data.get("technologies", []),
            summary=data.get("summary", {}),
            raw=data,
        )

    def frontend(self) -> List[Dict[str, Any]]:
        return [t for t in self.technologies if t.get("type") == "frontend"]

    def backend(self) -> List[Dict[str, Any]]:
        return [t for t in self.technologies if t.get("type") == "backend"]

    def infra(self) -> List[Dict[str, Any]]:
        return [t for t in self.technologies if t.get("type") == "infra"]

    def has_tech(self, name: str) -> bool:
        return any(t.get("name", "").lower() == name.lower() for t in self.technologies)

    def tech_names(self) -> List[str]:
        return [t.get("name", "") for t in self.technologies]


class TechStackFinder:
    """Client for the TechStack Finder API."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://techstack-finder.vercel.app"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def scan(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        cookies: Optional[str] = None,
        proxy: Optional[str] = None,
        timeout: Optional[int] = None,
    ) -> TechStackResult:
        """Scan a website and return detected technologies."""
        payload: Dict[str, Any] = {"url": url}
        if headers:
            payload["headers"] = headers
        if cookies:
            payload["cookies"] = cookies
        if proxy:
            payload["proxy"] = proxy
        if timeout:
            payload["timeout"] = timeout

        req_headers = {"Content-Type": "application/json"}
        if self.api_key:
            req_headers["x-api-key"] = self.api_key

        resp = requests.post(
            f"{self.base_url}/api/scan",
            json=payload,
            headers=req_headers,
            timeout=90,
        )
        resp.raise_for_status()
        data = resp.json()

        if not data.get("success"):
            raise RuntimeError(data.get("error", "Scan failed"))

        return TechStackResult.from_api(data)

    def badge(
        self,
        domain: str,
        theme: str = "dark",
        fmt: str = "svg",
    ) -> str:
        """Get an SVG badge URL for a domain."""
        return f"{self.base_url}/api/badge?domain={domain}&theme={theme}&format={fmt}"

    def history(self) -> List[Dict[str, Any]]:
        """Fetch scan history (requires API key)."""
        req_headers = {}
        if self.api_key:
            req_headers["x-api-key"] = self.api_key

        resp = requests.get(
            f"{self.base_url}/api/history",
            headers=req_headers,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("history", []) if data.get("success") else []


__all__ = ["TechStackFinder", "TechStackResult"]
