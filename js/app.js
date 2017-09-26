/*globals ko, google */
var model = (function(){
    'use strict';
    // the greyscale style for the map
    var mapStyle = [
        {
            'featureType': 'administrative',
            'elementType': 'geometry',
            'stylers': [
                {
                    'color': '#a7a7a7'
                }
            ]
        },
        {
            'featureType': 'administrative',
            'elementType': 'labels.text.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#737373'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'on'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#efefef'
                }
            ]
        },
        {
            'featureType': 'landscape',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#dadada'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi',
            'elementType': 'labels.icon',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'labels',
            'stylers': [
                {
                    'visibility': 'simplified'
                }
            ]
        },
        {
            'featureType': 'poi.attraction',
            'elementType': 'labels.text',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'poi.park',
            'elementType': 'all',
            'stylers': [
                {
                    'visibility': 'off'
                },
                {
                    'saturation': '29'
                }
            ]
        },
        {
            'featureType': 'road',
            'elementType': 'labels.text.fill',
            'stylers': [
                {
                    'color': '#696969'
                }
            ]
        },
        {
            'featureType': 'road',
            'elementType': 'labels.icon',
            'stylers': [
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'road.highway',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#ffffff'
                }
            ]
        },
        {
            'featureType': 'road.highway',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#b3b3b3'
                }
            ]
        },
        {
            'featureType': 'road.arterial',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#ffffff'
                }
            ]
        },
        {
            'featureType': 'road.arterial',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'color': '#d6d6d6'
                }
            ]
        },
        {
            'featureType': 'road.local',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'visibility': 'on'
                },
                {
                    'color': '#ffffff'
                },
                {
                    'weight': 1.8
                }
            ]
        },
        {
            'featureType': 'road.local',
            'elementType': 'geometry.stroke',
            'stylers': [
                {
                    'color': '#d7d7d7'
                }
            ]
        },
        {
            'featureType': 'transit',
            'elementType': 'all',
            'stylers': [
                {
                    'color': '#808080'
                },
                {
                    'visibility': 'off'
                }
            ]
        },
        {
            'featureType': 'water',
            'elementType': 'geometry.fill',
            'stylers': [
                {
                    'color': '#d3d3d3'
                }
            ]
        }
    ];
    // the pass Objects to create the list and the markers from.
    var passes = [
        {
            id: 1,
            title: 'Grimsel',
            location: {lat: 46.561779, lng: 8.344811 },
            visible: true
        },
        {
            id: 2,
            title: 'Furka',
            location: {lat:46.572160, lng: 8.414309 },
            visible: true
        },
        {
            id: 3,
            title: 'Oberalp',
            location: {lat: 46.659079, lng: 8.671124},
            visible: true
        },
        {
            id: 4,
            title: 'Nufenen',
            location: {lat: 46.477448, lng: 8.386521},
            visible: true
        },
        {
            id: 5,
            title: 'Lukmanier',
            location: {lat: 46.5640536347374, lng: 8.801765441894531},
            visible: true
        },
        {
            id: 6,
            title: 'Susten',
            location: {lat: 46.729505, lng: 8.447437},
            visible: true
        }
    ];

    // reference to the google.maps.Map object
    var map = null;

    // initial center coordinates of the map
    var INITIAL_CENTER = {lat:46.6203586, lng: 8.5441755};

    // initial zoom level of the map
    var INITIAL_ZOOM = 11;

    // represent a single pass
    var Pass = function(id, name, location, visibility) {
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.location = ko.observable(location);
        this.visibility = ko.observable(visibility);
    };

    // default marker
    var defaultMarkerIcon = function() {
        return viewModel.makeMarkerIcon('2196f3');
    };

    // highlighted marker
    var highlightedMarkerIcon = function() {
        return viewModel.makeMarkerIcon('ff5722');
    };

    /*
    @description: getter for the map style array
    */
    var getMapStyle = function() {
        return mapStyle;
    };

    /*
    @description: getter for the passes array
    */
    var getPasses = function() {
        return passes;
    };

    return {
        map: map,
        INITIAL_ZOOM: INITIAL_ZOOM,
        INITIAL_CENTER: INITIAL_CENTER,
        Pass: Pass,
        defaultMarkerIcon: defaultMarkerIcon,
        highlightedMarkerIcon: highlightedMarkerIcon,
        getMapStyle: getMapStyle,
        getPasses: getPasses
    };
})();

/*
@description: the ViewModel used by knockout.js
*/
var ViewModel = function() {
    'use strict';

    /*
    @description: array for all the google.maps.Marker objects on the map.
    this array is neccessary to hide the markers when they don't match the filter.
    */
    this.mapMarkers = [];

    /*
    @description: array for all the list marker objects on the map.
    */
    this.markers = ko.observableArray(model.getPasses().map(function(pass) {
        return new model.Pass(pass.id, pass.title, pass.location, pass.visible);
    }));

    /*
    @description: computed array with all the visible list markers.
    */
    this.filteredMarkers = ko.computed(function() {
        return ko.utils.arrayFilter(this.markers(), function(marker){
            return marker.visibility() === true;
        });
    }, this);

    /*
    @description: returns a map marker by id.
    @Param {number} id - the id property of the marker who needs to be returned.
    */
    this.getMarkerById = function(id) {
        for (var i = 0; i < this.mapMarkers.length; i++) {
            var currentMarker = this.mapMarkers[i];        
            if (currentMarker.id === id) {
                return currentMarker;
            }
        }
    };

    /*
    @description: initialize the filterable passlist and all
    the map markers. Add the neccessary Eevent listener to the filter input.
    @Param {object} map - The google.maps.Map object to display the markers on.
    */
    this.init = function(map) {
        model.map = map;
        model.map.addListener('click', function(e) {
            console.log(e.latLng.lat() + '/' + e.latLng.lng());
        });
        var filter = document.getElementById('pass-filter');
        filter.addEventListener('input', function(e){
            var searchString = e.target.value;
            this.filterMarkers(searchString.toLowerCase());
        }.bind(this));
        this.displayMarkers(map);
    };

    /*
    @description: this function takes in a color, and then creates a new marker
    icon of that color. The icon will be 21 px wide by 34 high, have an origin
    of 0, 0 and be anchored at 10, 34).
    */
    this.makeMarkerIcon = function (markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +'|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    },

    /*
    @description: display all the filtered markers on the map
    @Param {object} map - The google.maps.Map object to display the markers on.
    */
    this.displayMarkers = function(map) {
        this.removeMapMarkers();
        this.filteredMarkers().forEach(function(marker) {
            var mapMarker = new google.maps.Marker({
                id: marker.id(),
                position: marker.location(),
                title: marker.name(),
                icon: model.defaultMarkerIcon(),
                map: map
            });
            mapMarker.addListener('click', function() {
                viewModel.bounceOnce(this);
                viewModel.populateInfoWindow(this);
            });
            mapMarker.addListener('mouseover', function() {
                this.setIcon(model.highlightedMarkerIcon());
            });
            mapMarker.addListener('mouseout', function() {
                this.setIcon(model.defaultMarkerIcon());
            });
            this.mapMarkers.push(mapMarker);
        }, this);
        this.panToMarkers();  
    };

    /*
    @description: make a marker bouncing but only once.
    @Param {object} marker - a google.maps.Marker object.
    */
    this.bounceOnce = function(marker) {
        marker.setIcon(model.highlightedMarkerIcon());
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Bounce only once
        window.setTimeout(function(){
            marker.setAnimation(null);
            marker.setIcon(model.defaultMarkerIcon());
        },700);
    };

    /*
    @description: If only one marker is visible, center the map on it
    otherwise set center an zoom to the initial values.
    */
    this.panToMarkers = function() {
        if (this.filteredMarkers().length === 1) {
            model.map.setZoom(14);
            model.map.panTo(this.filteredMarkers()[0].location());
            this.bounceOnce(this.mapMarkers[0]);
        } else {
            model.map.panTo(model.INITIAL_CENTER);
            model.map.setZoom(model.INITIAL_ZOOM);
        }
    };

    /*
    @description: filter the markers based on a search string from the input field.
    @Param {string} searchString - The string to filter the pass names against.
    */
    this.filterMarkers = function(searchString) {
        this.markers().forEach(function(marker) {
            if (searchString.length === 0) {
                marker.visibility(true);
            } else {
                if (marker.name().toLowerCase().indexOf(searchString)) {
                    marker.visibility(false);
                } else {
                    marker.visibility(true);
                }
            }
        });
        this.displayMarkers(model.map);
        //display the info window if there is only one marker on the map.
        if (this.filteredMarkers().length === 1) {
            var visibleListElement  = this.filteredMarkers()[0];
            this.showInfoWindow(visibleListElement);
        }
        
    };

    /*
    @description: hides every marker on the map.
    */
    this.removeMapMarkers = function() {
        this.mapMarkers.forEach(function(marker){
            marker.setMap(null);
        });
        //empty the mapMarkers array
        this.mapMarkers = [];
    };

    /*
    @description: show the right info window when a list item gets clicked
    @param {object} marker - the list marker object that got clicked. (not the map marker object).
    */
    this.showInfoWindow = function(marker) {
        var mapMarker = viewModel.getMarkerById(marker.id());
        mapMarker.icon = 
        viewModel.bounceOnce(mapMarker);
        window.setTimeout(function(){
            viewModel.populateInfoWindow(mapMarker);
        }, 750);
        
    };

     /*
    @description: search wikipedia articles for a given keyword.
    @param {string} searchstring - the keyword to search for in wikipedia.
    @return array with two elements. The description and the link to a wikipedia article.
    */
    this.getWikipediaArticle = function(searchstring) {
        fetch("https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search="+searchstring+"&limit=5").then(function(resp) {
            if (resp.ok) {
                console.log(resp);
                return resp.json();
            }
            // if response not ok
            throw new Error('Network response was not ok.');
        }).then(function(data) {
            console.log(data);
            var name = data[0];
            var description = data[2][0] || 'Sorry, no Wikipedia description available';
            var link = data[3][0] || 'Sorry, no Wikipedia article available';
            viewModel.addWikiToInfoWindow(name, description, link);
        }).catch(error => {
            console.log('error: ' + error.message);
        });
    }

    this.addWikiToInfoWindow = function(name, description, link) {
        var wikiInfoContent = '<h4>'+name+'</h4>';
        wikiInfoContent += '<div>' + description + '</div><hr>';
        wikiInfoContent += '<a href="'+link+'">'+ link + '</a><hr>';
        console.log(wikiInfoContent);
        model.infoWindow.setContent(wikiInfoContent);
    }

    /*
    @description: Show the info window an populate it with content.
    @param {object} marker - the map marker object that got clicked.
    */
    this.populateInfoWindow = function(marker) {
        viewModel.getWikipediaArticle(marker.title);
        //check if there is allready an infoWindow instance available
        if (!model.infoWindow) {
            model.infoWindow = new google.maps.InfoWindow({maxWidth: 420});
        }
        //make sure the info window is not already opened on this marker
        if (model.infoWindow.marker != marker) {
            // clear iw content to give the streetview time to load.
            model.infoWindow.setContent('');
            model.infoWindow.marker = marker;
            // make sure the marker property is cleared if the infoWindow is closed
            model.infoWindow.addListener('closeclick', function() {
                model.infoWindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            /* In case the status is OK, which means the pano was found,
            compute the position of the streetview image, then calculate
            the heading, then get a panorama from that and set the options.
            */
            function getStreetView(data, status) {
                if (status === google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    var iwContent = model.infoWindow.getContent();
                    iwContent += '</div><div id="pano"></div>';
                    model.infoWindow.setContent(iwContent);
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 20 //vertical angle
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                } else {
                    // if status is not OK (failure)
                    model.infoWindow.setContent('<h2>' + marker.title + '</h2><span>No Street View Found, Sorry</span>');
                }
            }
            /* Use streetview service to get the closest streetview image within
             50 meters of the markers position 
             */
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            
            model.infoWindow.open(model.map, marker);
        }
    };
};

// activate knockout 
var viewModel = new ViewModel();
ko.applyBindings(viewModel);



