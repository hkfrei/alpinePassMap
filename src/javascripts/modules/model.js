/* global ko google */
/*
@description: Model Data
*/
export default (function(){
    'use strict';
    // the pass Objects to create the list and the markers.
    const passes = [
        {
            id: 1,
            title: 'Grimselpass',
            location: {lat: 46.561294739210176, lng: 8.337442874908447},
            visible: true,
            selected: false
        },
        {
            id: 2,
            title: 'Furkapass',
            location: {lat: 46.572794128573726, lng: 8.41529130935669},
            visible: true,
            selected: false
        },
        {
            id: 3,
            title: 'Oberalppass',
            location: {lat: 46.659079, lng: 8.671124},
            visible: true,
            selected: false
        },
        {
            id: 4,
            title: 'Nufenenpass',
            location: {lat: 46.4771475218557, lng: 8.387911319732666},
            visible: true,
            selected: false
        },
        {
            id: 5,
            title: 'Lukmanierpass',
            location: {lat: 46.5640536347374, lng: 8.801765441894531},
            visible: true,
            selected: false
        },
        {
            id: 6,
            title: 'Sustenpass',
            location: {lat: 46.729018, lng: 8.446040},
            visible: true,
            selected: false
        },
        {
            id: 7,
            title: 'Gotthardpass',
            location: {lat: 46.555481419906314, lng: 8.56656789779663},
            visible: true,
            selected: false
        },
        {
            id: 8,
            title: 'Klausenpass',
            location: {lat: 46.86808415801669, lng: 8.854765892028809},
            visible: true,
            selected: false
        },
        {
            id: 9,
            title: 'San Bernardinopass',
            location: {lat: 46.49576297064152, lng: 9.170665740966797},
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
    const INITIAL_CENTER = {lat:46.632464724627475, lng: 8.71490478515625};

    // initial zoom level of the map
    const INITIAL_ZOOM = 9;

    /*
    @description: this function takes in a color, and then creates a new marker
    icon of that color. The icon will be 21 px wide by 34 high, have an origin
    of 0, 0 and be anchored at 10, 34).
    */
    const makeMarkerIcon = function(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +'|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    };

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