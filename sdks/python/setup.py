from setuptools import setup, find_packages

setup(
    name="techstack-finder",
    version="1.0.0",
    description="Python SDK for TechStack Finder — detect any website's technology stack",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=["requests>=2.28.0"],
    author="TechStack Finder",
    license="MIT",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
    ],
)
