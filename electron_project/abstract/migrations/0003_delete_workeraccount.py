# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-10-20 04:57
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('abstract', '0002_workeraccount'),
    ]

    operations = [
        migrations.DeleteModel(
            name='WorkerAccount',
        ),
    ]