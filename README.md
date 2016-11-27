# Unified-Multilanguage-Reader

The Unified-Multilanguage-Reader is a web-based application that implements a multilingual article reading and language learning service that can be deployed amoungst multiple platforms (such as android and IOS).

The core system is a flask based application. When a web article is requested from this system, it will perform the following modifications before returning this article:
- Format the article into a neatly readable form.
- Insert zeeguu javascript that allows users to translate words.
