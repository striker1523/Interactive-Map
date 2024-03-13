// Tablica na wszystkie markery
let markers = [];

// Tablice na checkboxy do filtrów
let checkboxTypes = [];
let checkboxTypesValues = [];
let checkboxReligions = [];
let checkboxReligionsValues = [];
let checkboxEras = [];
let checkboxErasValues = [];
let checkboxPrefectures = [];
let checkboxPrefecturesValues = [];

// Input wyszukiwarki
let search_bar = document.getElementById('search-input');

//

// ---------------------------------------- //

// Funkcja do zmiany nulli na - 
function replaceNullsWithDash(obj) {
    for (var key in obj) {
      if (obj[key] === null) {
        obj[key] = "-";
      } else if (typeof obj[key] === "object") {
        replaceNullsWithDash(obj[key]);
      }
    }
}

// Funkcja do ukrywania markerów na mapie
function hideMarker(marker, map) {
    if (map.hasLayer(markers[marker])) {
        map.removeLayer(markers[marker]);
    }
}

// Funkcja do pokazywania markerów na mapie
function showMarker(marker, map) {
    if (!map.hasLayer(markers[marker])) {
        map.addLayer(markers[marker]);
    }
}

// Funkcja do uzupełniania tablic na filtry
function addFilter(column, value){
    if (column === "type"){
        checkboxTypes.push(column);
        checkboxTypesValues.push(value);
    }
    else if (column === "religion"){
        checkboxReligions.push(column);
        checkboxReligionsValues.push(value);
    }
    else if (column === "era"){
        checkboxEras.push(column);
        checkboxErasValues.push(value);
    }
    else if (column === "prefecture"){
        checkboxPrefectures.push(column);
        checkboxPrefecturesValues.push(value);
    }else{}
}

// Funkcja do usuwania z tablicy filtru
function removeFilter(column, value){
    if (column === "type"){
        const index = checkboxTypesValues.indexOf(value);
        if (index !== -1) {
            checkboxTypes.splice(index, 1);
            checkboxTypesValues.splice(index, 1);
        }
    }
    else if (column === "religion"){
        const index = checkboxReligionsValues.indexOf(value);
        if (index !== -1) {
            checkboxReligions.splice(index, 1);
            checkboxReligionsValues.splice(index, 1);
        }
    }
    else if (column === "era"){
        const index = checkboxErasValues.indexOf(value);
        if (index !== -1) {
            checkboxEras.splice(index, 1);
            checkboxErasValues.splice(index, 1);
        }
    }
    else if (column === "prefecture"){
        const index = checkboxPrefecturesValues.indexOf(value);
        if (index !== -1) {
            checkboxPrefectures.splice(index, 1);
            checkboxPrefecturesValues.splice(index, 1);
        }
    }
}

// Funkcja do uzupełniania SQL o filtry
function addSqlFilters(from, to, search){
    const whereConditions = [];
    if (checkboxTypesValues.length > 0) {
        whereConditions.push(`o.Type IN (${checkboxTypesValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxReligionsValues.length > 0) {
        whereConditions.push(`o.Religion IN (${checkboxReligionsValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxErasValues.length > 0) {
        whereConditions.push(`o.Era IN (${checkboxErasValues.map(value => `'${value}'`).join(',')})`);
    }
    if (checkboxPrefecturesValues.length > 0) {
        whereConditions.push(`o.Prefecture IN (${checkboxPrefecturesValues.map(value => `'${value}'`).join(',')})`);
    }
    if (from !== undefined && to !== undefined){
        whereConditions.push(`(o.year BETWEEN ${from} AND ${to} OR o.year IS NULL)`);
    }
    if (search_bar.value.length > 0){
        whereConditions.push(`
        o.name LIKE '%${search}%' OR 
        o.religion LIKE '%${search}%' OR 
        o.type LIKE '%${search}%' OR 
        o.era LIKE '%${search}%' OR 
        o.year LIKE '%${search}%' OR 
        o.prefecture LIKE '%${search}%' OR 
        o.postal_code LIKE '%${search}%' OR 
        o.municipality LIKE '%${search}%' OR 
        o.subdivision LIKE '%${search}%' OR 
        o.apartment LIKE '%${search}%' OR 
        o.description LIKE '%${search}%' OR 
        d.name LIKE '%${search}%' OR 
        d.description LIKE '%${search}%' OR 
        d.[group] LIKE '%${search}%'`);
    }
    const conditions = whereConditions.join(' AND ');
    console.log(conditions);
    console.log(markers.length);
    const encodedConditions = encodeURIComponent(conditions);
    return encodedConditions;
}

// Funkcja do uzupełniania lat do filtrów
function yearChangeForFilters(){
    let y_from = document.getElementById('range-from').value;
    let y_to = document.getElementById('range-to').value;
    y_from = (y_from === '') ? 0 : y_from; // if empty = 0
    y_to = (y_to === '') ? 10000 : y_to;  // if empty = 10000
    return [y_from, y_to];
}

// Funkcja do stworzenia wszystkich obiektów i ich danych
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

                                // Wyświetlenie komentarzy
                                fetch(`api/comments/${objectID}`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => {
                                    if (!response.ok) throw new Error('cojes5');
                                    return response.json();
                                })
                                .then(comms => {
                                    const comment_list = document.getElementById(`comment-list`);
                                    while (comment_list.firstChild) {
                                        comment_list.removeChild(comment_list.firstChild);
                                    }
                                    comms.forEach(e => {
                                        const listItem = document.createElement('li');
                                        const divbox = document.createElement('div');
                                        const span_name = document.createElement('span');
                                        const span_date = document.createElement('span');
                                        const brl = document.createElement('br');
                                        const span_content = document.createElement('span');
                                        listItem.id = 'comment-li'
                                        divbox.className = 'comment-box';
                                        span_name.className = 'comment-name';
                                        span_date.className = 'comment-date';
                                        span_content.className = 'comment-content';

                                        span_name.textContent = `${e.name}`;
                                        span_date.textContent = `${e.date}`;
                                        span_content.textContent = `${e.content}`;

                                        divbox.appendChild(span_name);
                                        divbox.appendChild(span_date);
                                        divbox.appendChild(brl);
                                        divbox.appendChild(span_content);
                                        listItem.appendChild(divbox);
                                        comment_list.appendChild(listItem);
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
    const map = L.map('map-id').setView([36.239368, 137.1976891], 5);

    const mainLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        minZoom: 3,
        maxZoom: 17,
        attribution: '&copy; <a href="https://carto.com/">carto.com</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    mainLayer.addTo(map);

    //Wywołanie markerów na mapie
    displayObjectsOnMap(map);

    // Funkcja do obsługi zmiany stanu checkboxa
    async function handleCheckboxChange(checkbox) {
        const value = checkbox.id;
        const column = checkbox.className;
        // Uzupełnianie tablic o odpowiednie filtry
        if (checkbox.checked) {
            addFilter(column, value);
        } else {
            removeFilter(column, value);
        }
        
        const [y_from, y_to] = yearChangeForFilters();
        const conditions = addSqlFilters(y_from, y_to);
        
        try {
            if (conditions.length > 0) {
                const response = await fetch(`/api/objects/filters/${conditions}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
    
                for (let i = 0; i < markers.length; i++) {
                    hideMarker(i, map);
                }
    
                data.forEach(item => {
                    showMarker(item.object_id - 1, map);
                });
            } else {
                for (let i = 0; i < markers.length; i++) {
                    showMarker(i, map);
                }
            }
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
            
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }
    
    const checkboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            handleCheckboxChange(checkbox);
        });
    });

    // Funkcja do filtrowania po roku
    async function handleInput_yearChange() {
        const [y_from, y_to] = yearChangeForFilters();
        const conditions = addSqlFilters(y_from, y_to);
        
        try {
            if (conditions.length > 0) {
                const response = await fetch(`/api/objects/filters/${conditions}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
    
                for (let i = 0; i < markers.length; i++) {
                    hideMarker(i, map);
                }
    
                data.forEach(item => {
                    showMarker(item.object_id - 1, map);
                });
            } else {
                for (let i = 0; i < markers.length; i++) {
                    showMarker(i, map);
                }
            }
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
            
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }

    // Pobranie inputów lat do filtrów
    const year_from = document.getElementById('range-from');
    year_from.addEventListener('change', () => { handleInput_yearChange(); });
    year_from.addEventListener('input', () => { //Walidacja
        const rangeFromValue = parseFloat(year_from.value);
        const rangeToValue = parseFloat(year_to.value);
    
        if (rangeToValue < rangeFromValue) {
            year_from.value = rangeToValue-1;
        }
    });
    const year_to = document.getElementById('range-to');
    year_to.addEventListener('change', () => { handleInput_yearChange(); });
    year_to.addEventListener('input', () => { //Walidacja
        const rangeFromValue = parseFloat(year_from.value);
        const rangeToValue = parseFloat(year_to.value);
    
        if (rangeToValue < rangeFromValue) {
            year_to.value = rangeFromValue+1;
        }
    });

    // Wyszukiwarka
    async function handleSearch_barChange(value) {
        const [y_from, y_to] = yearChangeForFilters();
        const conditions = addSqlFilters(y_from, y_to, value);
        
        try {
            if (conditions.length > 0) {
                const response = await fetch(`/api/objects/filters/${conditions}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
    
                for (let i = 0; i < markers.length; i++) {
                    hideMarker(i, map);
                }
    
                data.forEach(item => {
                    showMarker(item.object_id - 1, map);
                });
            } else {
                for (let i = 0; i < markers.length; i++) {
                    showMarker(i, map);
                }
            }
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
            
            for (let i = 0; i < markers.length; i++) {
                hideMarker(i, map);
            }
        }
    }
    search_bar.addEventListener('change', () => { handleSearch_barChange(search_bar.value); });

});