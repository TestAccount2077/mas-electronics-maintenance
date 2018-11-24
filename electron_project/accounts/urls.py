from django.conf.urls import url, include
from django.contrib import admin
from .views import *

urlpatterns = [
    
    # Regular URLs
    url(r'^login/$', validate_login),
    url(r'^logout/$', validate_logout),
    
    # Ajax URLs
    url(r'^ajax/worker-login/$', worker_login),
    url(r'ajax/get-password/$', get_password),
    url(r'ajax/change-password/$', change_password),
    url(r'ajax/update-cell-content/$', update_cell_content),
    
    url(r'ajax/upload-data/$', upload_data),
    url(r'ajax/download-data/$', download_data),
    
    url(r'ajax/update/$', update),
    url(r'ajax/sync/$', sync),
    url(r'ajax/check-download/$', check_download)
]
