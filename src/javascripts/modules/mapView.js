/*global google*/
/*
Inside this module, I placed functions that are responsible for getting content for the infoWindow.
I put them in a separate 'mapView' module, because they are explicitly here to display content on the map,
*/
export default (function(){
    'use strict';
    /*
    @description search wikipedia articles for a given keyword.
    @param {string} searchstring - the keyword to search for in wikipedia.
    @returns promise with the json response or an error message
    */
    const getWikipediaArticle = function(searchstring) {
        return new Promise(function(resolve, reject) {
            fetch('https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search='+searchstring+'&limit=2')
                .then(function(resp) {
                    if (resp.ok) {
                        resolve(resp.json());
                    }
                    // if response not ok
                    reject('Network response was not ok. No Wikipedia Info is available');
                })
                .catch(function(error) {
                    reject(error.message);
                });
        });
    };

    /*
    @description adds a street view panorama to the info window.
    @param {object} markter - the selected marker to add the info window to.
    @param {object} infoWindow - A google.maps.InfoWindow Instance.
    */
    const getStreetViewPanorama = function(marker, infoWindow, map) {
        'use strict';
        //get streetView data
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        /* In case the status is OK, which means the pano was found,
        compute the position of the streetview image, then calculate
        the heading, then get a panorama from that and set the options.
        */
        const getStreetView = function(data, status){
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 20 //vertical angle
                    }
                };
                new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } else {
                // if status is not OK (failure)
                var streetViewFailureContent = infoWindow.getContent();
                // remove the id=pano. No street view should be displayed
                streetViewFailureContent = streetViewFailureContent.replace(' id="pano"','');
                streetViewFailureContent += '<h6>No Street View Found, Sorry...</h6>';
                infoWindow.setContent(streetViewFailureContent);
            }
        };
        /* 
        Use streetview service to get the closest streetview image within
        50 meters of the markers position 
        */
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infoWindow.open(map, marker);
    };

    /*
    @description Create a material-design-lite card as info window content.
    @param {string} name - The name of the pass
    @param {string} description - A description of the pass or a fail message if no description is available.
    @param {string} link - a url to further information for this pass.
    @returns {string} string with the content for the info window
    */
    const getIwContent = function(name, description, link) {
        'use strict';
        var iwCard = `<div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__title mdl-card--border">
                        <h2 class="mdl-card__title-text">${name}</h2></div>
                        <div class="mdl-card__media" id="pano"></div>
                        <div class="mdl-card__supporting-text mdl-card--border">${description}<br>
                        (This text is provided by Wikipedia)</div>`;
        if (link) {
            iwCard += `<div class="mdl-card__actions"><a href="${link}" target="blank">Wikipedia article...</a></div></div>`;
        } else {
            iwCard += '<div class="mdl-card__actions">Sorry No Link to Wikipedia available</div></div>';
        }
        return iwCard;
    };

    /*
    @description Show the info window an populate it with wikipedia and streetview content.
    @param {object} marker - the map marker object that got clicked.
    @param {boolean} wikifail - a boolean value to indicate that it was not possible to load wikipedia infos.
    */
    const populateInfoWindow = function(marker, infoWindow) {
        //make sure the info window is not already opened on this marker
        if (infoWindow.marker !== marker) {
            // clear infoWindow content to give the streetview time to load.
            infoWindow.setContent('');
            infoWindow.marker = marker;
            // make sure the marker property is cleared if the infoWindow is closed
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            getWikipediaArticle(marker.title)
                .then(function(result) {
                    var name = result[0];
                    var description = result[2][0] || 'Sorry, no Wikipedia description available';
                    var link = result[3][0] || 'Sorry, no Wikipedia article available';
                    infoWindow.setContent(getIwContent(name, description, link));
                    //add streetView data to the Info Window
                    getStreetViewPanorama(marker, infoWindow);
                })
                .catch(function(errorMessage) {
                    // fetch failed. Add a corresponding message to the info window.
                    var name = marker.title;
                    var description = 'Sorry, no description available. There was an error while loading Wikipedia info';
                    description += '<br>Reason: ' + errorMessage;
                    var link = false;
                    infoWindow.setContent(getIwContent(name, description, link));
                    getStreetViewPanorama(marker, infoWindow);
                });
        }
    };

    return {
        populateInfoWindow: populateInfoWindow

    };
})();