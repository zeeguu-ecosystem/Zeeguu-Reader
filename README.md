# Unified-Multilanguage-Reader

The Unified-Multilanguage-Reader is split into two parts: a core web-based system that implements our main service, and a android app that allows users to easily access the service on their phone.

The core system is a flask based application. When a web article is requested from this system, it will perform the following modifications before returning this article:
- Format the article into a neatly readable form.
- Insert zeeguu javascript that allows you to translate words.
