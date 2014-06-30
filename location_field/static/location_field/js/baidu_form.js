($ || django.jQuery)(function($){
    if (typeof(g_script) == 'undefined' ) {
    g_script = document.createElement('script');
    g_script.type = 'text/javascript';
    g_script.src = 'http://api.map.baidu.com/api?v=1.5&ak=z6ByGv9ZLALtjHOGVoGXGGx5&'+
        'callback=form_set';
    document.body.appendChild(g_script);
    }
    else {
      form_set();
    }
});


//($ || django.jQuery)(function($){
function form_set() {
    function location_field_load(map, location_based, zoom)
    {
        var parent = map.parent().parent();

        var location_map;

        var location_coordinate = parent.find('input[type=text]');

        function savePosition(point)
        {
            location_coordinate.val(point.lng + "," + point.lat);
            location_map.panTo(point);
        }

        function load() {
            var point = new BMap.Point(1,1);

            
	    location_map = new BMap.Map(map[0]);
	    location_map.centerAndZoom(new BMap.Point(121.316646,31.149515),13);
	    location_map.enableScrollWheelZoom();

            var initial_position;

            if (location_coordinate.val())
            {
                var l = location_coordinate.val().split(/,/);

                if (l.length > 1)
                {
                    // initial_position = new google.maps.LatLng(l[0], l[1]);
		    initial_position = new BMap.Point(l[0], l[1]);
                }
            }

            var marker = new BMap.Marker(initial_position);
	    location_map.addOverlay(marker);
	    marker.enableDragging();


            marker.addEventListener('dragend', function(mouseEvent) {
                savePosition(mouseEvent.point);
            });

            marker.addEventListener('click', function(mouseEvent){
                marker.setPosition(mouseEvent.point);
                savePosition(mouseEvent.point);
            });

            var no_change = false;

            location_based.each(function(i, f)
            {
                var f = $(this),
                    cb = function()
                    {
                        no_change = true;

                        var lstr = [];

                        location_based.each(function(){
                            var b = $(this);

                            if (b.is('select'))
                                lstr.push(b.find('option:selected').html());
                            else
                                lstr.push(b.val())
                        });

                        geocode(lstr.join(','), function(l){
                            location_coordinate.val(l.lng+','+l.lat);
                            setTimeout(function(){ no_change = false; }, 2000);
                        });
                    };

                no_change = true;

                if (f.is('select'))
                    f.change(cb);
                else
                    f.keyup(cb);
            });

            location_coordinate.keyup(function(){
                if (no_change) return;
                var latlng = jQuery(this).val().split(/,/);
                if (latlng.length < 2) return;
                var latlng = new BMap.Point(latlng[0], latlng[1]);
                geocode_reverse(latlng, function(l){
                    location_coordinate.val(l.lng+','+l.lat);
                });
            });

            function placeMarker(location) {
                location_map.setZoom(zoom);
                marker.setPosition(location);
                location_map.setCenter(location);
                savePosition(location);
            }

            function geocode(address, cb) {
                var result;
                var geocoder = new BMap.Geocoder();
                if (geocoder) {
                    geocoder.getPoint(address, function(point) {
			if (point) {
			    cb(point);
			    placeMarker(point);
			}
                    });
                }
            }

            function geocode_reverse(location, cb) {
                var geocoder = new BMap.Geocoder();
                if (geocoder) {
                    geocoder.getLocation(location, function(results) {
			if (results) {
			    cb(location);
			    placeMarker(location);
			}
                    });
                }
            }

            placeMarker(initial_position);
        }

        load();
    }


    $('input[data-location-widget]').each(function(){
        var $el = $(this);

        var $map = $($el.attr('data-map')),
            $based_fields = $($el.attr('data-based-fields')),
            zoom = parseInt($el.attr('data-zoom'));

        location_field_load($map, $based_fields, zoom);
    });
}
//});

