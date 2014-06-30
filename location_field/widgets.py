from django.conf import settings
from django.forms import widgets
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

GOOGLE_MAPS_V3_APIKEY = getattr(settings, 'GOOGLE_MAPS_V3_APIKEY', None)
GOOGLE_API_JS = '//maps.google.com/maps/api/js?sensor=false'

if GOOGLE_MAPS_V3_APIKEY:
    GOOGLE_API_JS = '{0}&key={1}'.format(GOOGLE_API_JS, GOOGLE_MAPS_V3_APIKEY)


class LocationWidget(widgets.TextInput):
    def __init__(self, attrs=None, based_fields=None, zoom=None, suffix='', **kwargs):
        self.based_fields = based_fields
        self.zoom = zoom
        self.suffix = suffix
        super(LocationWidget, self).__init__(attrs)

    def render(self, name, value, attrs=None):
        if value is not None:
            try:
                if isinstance(value, basestring):
                    lat, lng = value.split(',')
                else:
                    lng = value.x
                    lat = value.y

                value = '%s,%s' % (
                    float(lat),
                    float(lng),
                )
            except ValueError:
                value = ''
        else:
            value = ''

        if '-' not in name:
            prefix = ''
        else:
            prefix = name[:name.rindex('-') + 1]

        based_fields = ','.join(
            map(lambda f: '#id_' + prefix + f.name, self.based_fields))

        attrs = attrs or {}
        attrs['data-location-widget'] = name
        attrs['data-based-fields'] = based_fields
        attrs['data-zoom'] = self.zoom
        attrs['data-suffix'] = self.suffix
        attrs['data-map'] = '#map_' + name

        text_input = super(LocationWidget, self).render(name, value, attrs)

        return render_to_string('location_field/map_widget.html', {
            'field_name': name,
            'field_input': mark_safe(text_input)
        })

    class Media:
        # Use schemaless URL so it works with both, http and https websites
        js = (
            GOOGLE_API_JS,
            settings.STATIC_URL + 'location_field/js/form.js',
        )



class BDLocationWidget(widgets.TextInput):
    def __init__(self, attrs=None, based_fields=None, zoom=None, **kwargs):
        self.based_fields = based_fields
        self.zoom = zoom
        super(BDLocationWidget, self).__init__(attrs)

    def render(self, name, value, attrs=None):
        if value is not None:
            if type(value) == str or type(value) == unicode:
                lat, lng = value.split(',')
            else:
                lng = value.x
                lat = value.y

            value = '%s,%s' % (
                float(lat),
                float(lng),
            )
        else:
            value = "121.31913,31.137071"

        if '-' not in name:
            prefix = ''
        else:
            prefix = name[:name.rindex('-') + 1]

        based_fields = ','.join(
            map(lambda f: '#id_' + prefix + f.name, self.based_fields))

        attrs = attrs or {}
        attrs['data-bd-location-widget'] = name
        attrs['data-bd-based-fields'] = based_fields
        attrs['data-bd-zoom'] = self.zoom
        attrs['data-bd-map'] = '#map_' + name

        text_input = super(BDLocationWidget, self).render(name, value, attrs)

        map_div = u'''
<div style="margin:4px 0 0 0">
    <label></label>
    <div id="map_%(name)s" style="width: 500px; height: 250px"></div>
</div>
'''
        return mark_safe(text_input + map_div % {'name': name})

    class Media:
        js = (
            'location_field/baidu_form.js',
        )
