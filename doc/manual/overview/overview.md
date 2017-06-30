# Introduction
Reading is one of the most beneficial ways for a learner to improve their mastery of a foreign language. In fact, McCarthy argues that [extensive reading, serving as a comprehensive training ground, has the potential to improve the other skills](https://eric.ed.gov/?id=ED452737): writing, listening, and speaking. 

However, the state of the art in supporting readers of foreign languages is lacking. On the one hand, traditional learning materials in textbooks are most often unattractive as they target the [non-existent](https://www.thestar.com/news/insight/2016/01/16/when-us-air-force-discovered-the-flaw-of-averages.html) generic learner. On the other hand, the majority of the materials available online are usually incompatible with the learner's current language skill level. Moreover, some learners are often trying to maintain a parallel learning process of multiple different foreign languages.

Making reading more adapted to the personalized needs of the individual, will help learners become more committed, and thus enable them to progress a lot faster. It is likely that language learners would be more engaged if they could read content that they find interesting, whilst also reaping the benefits of the actual process of learning a new language.

This project aims at creating and evaluating a reading platform that allows users to identify reading sources in their target language(s) that are both to their liking and at an appropriate difficulty level - sufficiently easy, but hard enough to be lightly challenging- whilst at the same time giving them the advantage of having translation possibilities at their fingertips for the new words that they encounter.

## Features
### Core
The core system of the platform that we will call The **U**nified **M**ultilingual **R**eader (**UMR**) should be based on the following features:

1. **A lightweight web application** that provides the user with a suitable, non-intrusive environment to read articles.
2. **On tap word translation** that uses the Zeeguu platform to fetch an appropriate translation for a given word, together with the possible alternative translations, derived from the context where that word is identified in.
3. **Feed subscription system** for retrieval of useful/interesting feeds, together with the articles they refer to, that uses the Zeeguu API and gives access to all its resources in all its available languages.
4. **Content extraction** from a given url and processing it into a readable, non-invasive format, by filtering the textual content from any unnecessary clutter.
5. The possibility for the user to obtain a **pronunciation** of the translated word.
6. The possibility for the user to provide **personal alternatives** on the obtained translations -- given that machine translation can never be perfect.

### Extensions
To extend the core UMR system, several extension ideas will be considered:

1. **Feed suggestion** based on specific categories of interest achieved by NLP-based analysis of user interest.
2. **Comic Panel reader**, using data from the Zeeguu Exercise platform to supply the users with translatable comic panels alongside the already present articles.
3. Simple wrapper application for the main **mobile platforms** (i.e. Android and/or iOS).
4. Support for **automatic detection of idioms**, a group of words established by usage as having a meaning not deducible from those of the individual words.
5. **Improved article listing** by using more natural sorting procedures.
6. **Feed descriptions** for each of the available sources.
7. Support for **dictionary** capabilites.

## Non-functional attributes
The main non-functional attributes of the implemented system are:

- **Maintainability:** focusing on high-quality source code and comprehensive documentation.
- **Usability:** especially focusing on an intuitive user interface.
- **Performance:** both the article recommender and the interactive translations must be fast enough to be perceived as seamless by the reader.