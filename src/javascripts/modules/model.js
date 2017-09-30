/* global ko google */
/*
@description: Model Data
*/
export default (function(){
    'use strict';
    
    // the pass Objects to create the list and the markers from.
    const passes = [
        {
            id: 1,
            title: 'Grimsel',
            location: {lat: 46.561779, lng: 8.344811},
            visible: true,
            selected: false
        },
        {
            id: 2,
            title: 'Furka',
            location: {lat:46.572160, lng: 8.414309},
            visible: true,
            selected: false
        },
        {
            id: 3,
            title: 'Oberalp',
            location: {lat: 46.659079, lng: 8.671124},
            visible: true,
            selected: false
        },
        {
            id: 4,
            title: 'Nufenen',
            location: {lat: 46.477448, lng: 8.386521},
            visible: true,
            selected: false
        },
        {
            id: 5,
            title: 'Lukmanier',
            location: {lat: 46.5640536347374, lng: 8.801765441894531},
            visible: true,
            selected: false
        },
        {
            id: 6,
            title: 'Susten',
            location: {lat: 46.729018, lng: 8.446040},
            visible: true,
            selected: false
        }
    ];

    // represent a single pass
    const Pass = function(id, name, location, visibility, selected) {
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.location = ko.observable(location);
        this.visibility = ko.observable(visibility);
        this.selected = ko.observable(selected);
    };

    // initial center coordinates of the map
    const INITIAL_CENTER = {lat:46.6203586, lng: 8.5441755};

    // initial zoom level of the map
    const INITIAL_ZOOM = 11;

    /*
    @description: this function takes in a color, and then creates a new marker
    icon of that color. The icon will be 21 px wide by 34 high, have an origin
    of 0, 0 and be anchored at 10, 34).
    */
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +'|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }

    // default marker
    const defaultMarkerIcon = function() {
        return makeMarkerIcon('7c4dff');
    };

    // highlighted marker
    const highlightedMarkerIcon = function() {
        return makeMarkerIcon('cddc39');
    };

    /*
    @description: getter for the passes array
    */
    const getPasses = function() {
        return passes;
    };

    return {
        Pass: Pass,
        INITIAL_ZOOM: INITIAL_ZOOM,
        INITIAL_CENTER: INITIAL_CENTER,
        defaultMarkerIcon: defaultMarkerIcon,
        highlightedMarkerIcon: highlightedMarkerIcon,
        getPasses: getPasses
    };
})();