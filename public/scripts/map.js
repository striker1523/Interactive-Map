// Tablica na wszystkie markery
const markers = new Array();
const visibleMarkers = new Array();

function replaceNullsWithDash(obj) {
    for (var key in obj) {
      if (obj[key] === null) {
        obj[key] = "-";
      } else if (typeof obj[key] === "object") {
        replaceNullsWithDash(obj[key]);
      }
    }
}

function hideMarker(marker, map) {
    map.removeLayer(markers[marker]);
}

function showMarker(marker, map) {
    map.addLayer(markers[marker]);
}

function displayObjectsOnMap(map) {
    fetch('/api/objects')
        .then(response => response.json())
        .then(data => {
            replaceNullsWithDash(data);
            //console.log(data);
            data.forEach(row => {
                const { object_id, name, religion, type, year, prefecture, postal_code, municipality, subdivision, apartment, Latitude, Longitude } = row;

                let iconType;
                switch (type) {
                    case 'Shrine':
                        iconType = '../assets/img/icons/icon_shrine.png';
                        break;
                    case 'Castle':
                        iconType = '../assets/img/icons/icon_castle.png';
                        break;
                    case 'Temple':
                        iconType = '../assets/img/icons/icon_temple.png';
                        break;
                    case 'Mausoleum':
                        iconType = '../assets/img/icons/icon_mausoleum.png';
                        break;
                    default:
                        iconType = '../assets/img/icons/icon_default.png';
                }
                var Icon = L.icon({
                    iconUrl: iconType,
                    shadowUrl: '../assets/img/icons/marker-shadow.png',
                    iconSize:     [25, 41],
                    shadowSize:   [29, 32],
                    iconAnchor:   [12, 40],
                    shadowAnchor: [10, 32], 
                    popupAnchor:  [0, -35]
                });

                const popupContent =
                    '<span style="font-weight: bold; color: #f54b55; font-size: 18px;">' + name +'</span><br>'+
                    '<b>Address:</b> '+ apartment +', '+ subdivision +', '+ municipality +', '+ postal_code +', '+ prefecture +'<br>'+
                    '<b>Religion:</b> '+ religion +'<br>'+
                    '<b>Type:</b> '+ type +'<br>'+
                    '<b>Year:</b> '+ year +'<br>'+
                    '<button id="toRoute" class="toRoute-butt">Add to route</button>'+
                    '<button id="details" class="details-butt">Details</button>'+
                    '<span id="popupid" hidden>'+ object_id +'</span>';

                const popup = L.popup({
                    className: 'pop-up',
                    autoPan: true,
                    maxWidth:1000, 
                    maxHeight:1000
                }).setContent(popupContent);

                let i = 0;
                const marker = new L.marker([Latitude, Longitude], {icon: Icon}).addTo(map)
                    .bindPopup(popup)
                    .on('popupopen', function(e) {
                        const detailsButton = e.popup._contentNode.querySelector('#details');
                        detailsButton.addEventListener('click', function() {

                            //Pobranie ID obiektu do tymczasowego diva
                            const popupID = e.popup._content;
                            const temp = document.createElement('div');
                            temp.innerHTML = popupID;
                            const objectID = temp.querySelector('#popupid').innerText;
                            temp.remove();

                            //Pobranie danych obiektu na podstawie ID
                            fetch(`api/objects/${objectID}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                            .then(response => {
                                if (!response.ok) throw new Error('cojes5');
                                return response.json();
                            })
                            .then(data => {
                                replaceNullsWithDash(data);

                                //Przypisanie danych z bazy
                                const { image, name, religion, 
                                    type, era, year, prefecture, description } = data;
                                const objectNameLabel = document.querySelector('.obj-name');
                                objectNameLabel.textContent = name;
                                const objectDescLabel = document.querySelector('.object-desc');
                                objectDescLabel.textContent = description;
                                const objectDetTypelabel = document.querySelector('#type');
                                objectDetTypelabel.innerHTML = '<b style="color:#f54b55;">Type: </b>' + type;
                                const objectDetPrefLabel = document.querySelector('#prefecture');
                                objectDetPrefLabel.innerHTML = '<b style="color:#f54b55;">Prefecture: </b>' + prefecture;
                                const objectDetRelLabel = document.querySelector('#religion');
                                objectDetRelLabel.innerHTML = '<b style="color:#f54b55;">Religion: </b>' + religion;
                                const objectDetEraLabel = document.querySelector('#era');
                                objectDetEraLabel.innerHTML = '<b style="color:#f54b55;">Era: </b>' + era;
                                const objectDetYearLabel = document.querySelector('#year');
                                objectDetYearLabel.innerHTML = '<b style="color:#f54b55;">Year: </b>' + year;

                                // Pobranie danych o bóstwach powiązanych z obiektem
                                fetch(`api/objects/deities/${objectID}`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => {
                                    if (!response.ok) throw new Error('cojes5');
                                    return response.json();
                                })
                                .then(deities => {
                                    replaceNullsWithDash(deities);

                                    // Delete poprzednich
                                    const deitiesList = document.getElementById('deities-list');
                                    while (deitiesList.firstChild) {
                                        deitiesList.removeChild(deitiesList.firstChild);
                                    }
                                    deities.forEach(deity => {
                                        const listItem = document.createElement('li');
                                        listItem.textContent = `${deity.name}`;
                                        deitiesList.appendChild(listItem);
                                    });
                                })
                                .catch(error => console.error(error));      
                            })
                            .catch(error => console.error(error));
                        });
                    });
                    markers.push(marker);
                    map.addLayer(markers[i]);
                    i++;   
            });
        })
        .catch(error => {
            console.error('Error fetching objects:', error);
        });
}

window.addEventListener('load', () => {
    //Pozwolenie na notyfikacje
    Notification.requestPermission().then((result) => {
        console.log(result);
    });

    //Wyświetlanie bazowej mapy
    const map = L.map('map-id').setView([36.23730702442495, 138.5969055419427], 7);

    const mainLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        minZoom: 3,
        maxZoom: 17,
        attribution: '&copy; <a href="https://carto.com/">carto.com</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    mainLayer.addTo(map);

    //Wywołanie markerów na mapie
    displayObjectsOnMap(map);

    // Funkcja do obsługi zmiany stanu checkboxa
    function handleCheckboxChange(checkbox) {
        const what = checkbox.id;
        const from = checkbox.className;
        fetch(`/api/objects/filters/${from}/${what}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Sprawdź, czy stan checkboxa się zmienił
            const isChecked = checkbox.checked;
            data.forEach(item => {
                for (let i = 0; i < markers.length; i++) {
                    hideMarker(i, map);
                }
                const index = visibleMarkers.indexOf(item.object_id);
                if (isChecked && index === -1) {
                    visibleMarkers.push(item.object_id);
                } else if (!isChecked && index !== -1) {
                    visibleMarkers.splice(index, 1);
                }
            });
            // Pokaż lub ukryj markery na podstawie nowego stanu
            visibleMarkers.forEach(e => {
                showMarker(e-1, map);
            });
            // Jeśli wszystkie checkboxy zostały odznaczone, pokaż wszystkie markery
            if (!Array.from(checkboxes).some(cb => cb.checked)) {
                for (let i = 0; i < markers.length; i++) {
                    showMarker(i, map);
                }
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    // Pobranie wszystkich checkboxów
    const checkboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            handleCheckboxChange(checkbox);
        });
    });
});