# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-08-25 23:47
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('receipts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ArchiveDevice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('leave_date', models.DateTimeField()),
                ('delivery_receipt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='devices', to='receipts.DeliveryReceipt')),
            ],
            options={
                'ordering': ('created',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='InventoryDevice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('serial_number', models.CharField(max_length=300)),
                ('device_type', models.CharField(max_length=300)),
                ('entrance_date', models.DateTimeField()),
                ('delivered', models.BooleanField(default=False)),
                ('reception_receipt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='devices', to='receipts.ReceptionReceipt')),
            ],
            options={
                'ordering': ('created',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MaintenanceDevice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('assignee', models.CharField(default='', max_length=300)),
                ('flaws', models.CharField(default='', max_length=300)),
                ('sparepart_count', models.IntegerField(blank=True, null=True)),
                ('notes', models.CharField(default='', max_length=300)),
                ('deleted', models.BooleanField(default=False)),
                ('inventory_device', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_device', to='devices.InventoryDevice')),
            ],
            options={
                'ordering': ('created',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Sparepart',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=300)),
                ('count', models.IntegerField()),
                ('minimum_qty', models.IntegerField()),
            ],
            options={
                'ordering': ('created',),
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='maintenancedevice',
            name='sparepart',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='devices.Sparepart'),
        ),
        migrations.AddField(
            model_name='archivedevice',
            name='inventory_device',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='archive_device', to='devices.InventoryDevice'),
        ),
    ]