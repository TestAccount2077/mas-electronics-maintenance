from django.conf.urls import url, include
from django.contrib import admin
from .views import *

app_name = 'receipts'

urlpatterns = [
    
    # Regular URLs
    url(r'^reception-receipt-archive/$', reception_receipt_archive_view, name='reception_receipt_archive_view'),
    url(r'^delivery-receipt-archive/$', delivery_receipt_archive_view, name='delivery_receipt_archive_view'),
    
    url(r'^reception-receipt-archive/(?P<pk>[0-9]+)/$', reception_receipt_detail, name='reception_receipt_detail'),
    url(r'^delivery-receipt-archive/(?P<pk>[0-9]+)/$', delivery_receipt_detail, name='delivery_receipt_detail'),
    
    # Ajax URLs
    url(r'ajax/get-device-receipts/$', get_device_receipts),
        
    url(r'ajax/filter-receipt-archive/$', filter_receipt_archive),
]
