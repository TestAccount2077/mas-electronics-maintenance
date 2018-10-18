from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from rest_framework import status

from accounts.models import WorkerAccount

from devices.models import *
from devices.getters import ReceiptGetter

from abstract.models import App
from abstract.web_handlers import UploadHandler, DownloadHandler, UpdateHandler

from . import utils

from receipts.models import *

import json
    
def validate_login(request):

    data = request.GET
    username = data['username']
    password = data['password']
    remember_me = json.loads(data['rememberMe'])
    context = {}
    
    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)

        context['is_valid'] = True

        if not remember_me:
            request.session.set_expiry(0)

        return JsonResponse(context)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:

        context['invalid_username'] = True

        return JsonResponse(context, status=400)

    if user.password != password:
        context['invalid_password'] = True

    return JsonResponse(context, status=400)
    
def validate_logout(request):
    
    if request.is_ajax():
        logout(request)
        return JsonResponse({})
    
def get_password(request):
    
    if request.is_ajax():
                
        return JsonResponse(
            {
                'password': App.objects.first().password
            }
        )
    
def change_password(request):
    
    if request.is_ajax():
                
        app = App.objects.first()
        
        app.password = request.GET['password']
        app.save()
        
        return JsonResponse({})
    
def update_cell_content(request):
    
    if request.is_ajax():
        
        data = request.GET
        
        pk = data['pk']
        item_type = data['type']
        field_name = data['fieldName']
        content = data['content']
        
        valid, data = utils.update_cell_content(pk, item_type, field_name, content)
        
        if not valid:
            
            return JsonResponse(data, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse(data)

def upload_data(request):
    
    if request.is_ajax():
        
        upload_handler = UploadHandler()
        
        if upload_handler.errors:
            return JsonResponse(upload_handler.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({})

def download_data(request):
    
    if request.is_ajax():
        
        download_handler = DownloadHandler()
        
        if download_handler.errors:
            return JsonResponse(download_handler.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({})
    
def update(request):
    
    if request.is_ajax():
        
        update_handler = UpdateHandler()
        
        if update_handler.errors:
            return JsonResponse(update_handler.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({})

def worker_login(request):
    
    if request.is_ajax():
        
        data = request.GET
        context = {}
        
        password = data['password']
        
        account = WorkerAccount.objects.filter(password=password)
        
        if account.exists():
            
            account = account.first()
            username = context['username'] = account.username
            
            context['devices'] = [
                device.as_dict() for device in MaintenanceDevice.objects.filter(
                    inventory_device__delivered=False,
                    assignee=username
                )
            ]
            
            return JsonResponse(context)
        
        else:
            return JsonResponse({'does_not_exist': 'هذا الرقم غير موجود'}, status=status.HTTP_400_BAD_REQUEST)
        
def sync(request):
    
    if request.is_ajax():
        
        unsynced_devices = MaintenanceDevice.objects.filter(
            inventory_device__delivered=False,
            synced=False
        )
        
        devices = [device.as_sync_dict() for device in unsynced_devices]
        
        unsynced_devices.update(synced=True)
        
        return JsonResponse({
            'devices': devices
        })
