import article


def test_remove_images():
    """Assert if images are properly removed."""
    text = "<img>image</img><div class='wp-caption-text'>Some caption</div> Text <hr />"
    expected = " Text "
    result = article.remove_images(text)
    assert result == expected


def test_wrap_zeeguu_words():
    """Assert if words are properly wrapped."""
    text = "word <wrapped>word</wrapped>"
    expected = "<zeeguu>word</zeeguu> <wrapped><zeeguu>word</zeeguu></wrapped>"
    result = article.wrap_zeeguu_words(text)
    assert result == expected

