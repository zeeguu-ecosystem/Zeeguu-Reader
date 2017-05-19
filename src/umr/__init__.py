from .umr_blueprint import umrblue

# make sure that we load the .article and .articles endpoints.
# otherwise our blueprint won't be complete!

from .articles import get_articles_page
from .article import get_article