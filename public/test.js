// Funkcja do obsługi zmiany stanu checkboxa
function handleCheckboxChange(checkbox) {
    const what = checkbox.id;
    const from = checkbox.className;

    // Sprawdź, czy stan checkboxa się zmienił
    const isChecked = checkbox.checked;
    // Uzupełnij tablice o wybrane kategorie
    if (isChecked){
        checkboxIds.push(what);
        checkboxClasses.push(from);
        console.log(checkboxIds);
    }else if(!isChecked){
        var index = checkboxIds.indexOf(what);
        if (index !== -1) {
            checkboxIds.splice(index, 1);
            checkboxClasses.splice(index, 1);
            console.log(checkboxIds);
        }
    }

    fetch(`/api/objects/filters/${from}/${what}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Ukryj wszystkie markery
        for (let i = 0; i < markers.length; i++) {
            hideMarker(i, map);
        }
        data.forEach(item => {
            if(checkboxIds.every(id => item[checkboxClasses[checkboxIds.indexOf(id)]] === id) && isChecked){


                // Kategoria zaznaczona = dodaj go
                visibleMarkers.push(item.object_id);
                console.log(visibleMarkers);
                
            }
            else if(!isChecked){
                const index = visibleMarkers.indexOf(item.object_id);
                if (index !== -1) {    // Kategoria odznaczona usuń go
                    visibleMarkers.splice(index, 1);
                }
            }
        });
        // Pokaż markery na podstawie nowego stanu
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