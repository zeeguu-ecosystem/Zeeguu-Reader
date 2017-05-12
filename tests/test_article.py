import article


def test_add_paragraphs():
    """Assert if newlines are replaced with paragraphs."""
    text = "\n"
    expected = "<p></p>"
    result = article.add_paragraphs(text)
    assert result == expected


def test_wrap_zeeguu_words():
    """Assert if words are properly wrapped."""
    text = "word <wrapped>word</wrapped>"
    expected = "<zeeguu>word</zeeguu> <wrapped><zeeguu>word</zeeguu></wrapped>"
    result = article.wrap_zeeguu_words(text)
    assert result == expected

