from flask import Blueprint

umrblue = Blueprint('umrblue', __name__,
                    template_folder='templates',
                    static_folder='static')

print (" == created umrblue...")

