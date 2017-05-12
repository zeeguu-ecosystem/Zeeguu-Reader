import article



def test_wrap_zeeguu_words():
    """Assert if words are properly wrapped."""
    text = "word <wrapped>word</wrapped>"
    expected = "<zeeguu>word</zeeguu> <wrapped><zeeguu>word</zeeguu></wrapped>"
    result = article.wrap_zeeguu_words(text)
    assert result == expected

