# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

`internaapp-db` is a GitHub Pages site managed via Jekyll. The repository was initialized with the standard GitHub Pages `.gitignore` (covering `_site/`, `.jekyll-cache/`, `.sass-cache/`, and `Gemfile.lock`) but no Jekyll scaffold has been committed yet — there is no `_config.yml`, `Gemfile`, or content directory as of the initial commit.

## Jekyll / GitHub Pages Development

Once a Jekyll scaffold exists, the standard workflow is:

```bash
# Install dependencies (requires Ruby + Bundler)
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Build to _site/ (not committed — excluded by .gitignore)
bundle exec jekyll build
```

GitHub Pages deploys automatically from the `main` branch on every push; no manual deploy step is needed.

## Branch Strategy

Active development happens on feature branches and is merged into `main`. The current working branch for Claude Code sessions is `claude/add-claude-documentation-NLFI7`.

## Current State

The repository contains only `.gitignore` and `README.md`. Before meaningful development can begin, the Jekyll project scaffold needs to be added (e.g., via `jekyll new .` or by manually creating `_config.yml`, `Gemfile`, and content files).
