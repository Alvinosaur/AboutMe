// Sources: https://www.w3schools.com/jsref/met_document_createelement.asp
// https://bitsofco.de/a-one-line-solution-to-highlighting-search-matches/
function searchProjects(words, projects) {
    var priority1 = [];
    var priority2 = [];

    $.each( projects, function( proj_key, entries ) {
        var title = entries["title"].toLowerCase();
        var keywords = entries["keywords"];
        var found_match = false;

        // check if any search words match with project
        for (var wi=0; wi<words.length; wi++){
            var lookup = words[wi].toLowerCase();

            // if search word in key => first priority
            if (title.includes(lookup)) {
                priority1.push(proj_key);
                found_match = true;
                break;
            }

            // if search word in keywords => second priority
            for (var ki=0; ki<keywords.length; ki++) {
                var keyword = keywords[ki].toLowerCase();
                if (keyword.includes(lookup)) {
                    priority2.push(proj_key);
                    found_match = true;
                    break;
                }
            }
            if (found_match) break;
        }

        // don't show project in search result if no match
        if (!found_match) {
            var main_key = '.' + proj_key;
            $(main_key).css('display', 'none');
        }
    });

    // TODO: Implement with maxHeap so show projects by order of relevance
    var matches = [...priority1, ...priority2];
    console.log("Matches: " + matches.join(", "));
    for (var pi=0; pi<matches.length; pi++) {
        var proj_key = matches[pi];
        var title = projects[proj_key]["title"];
        var keywords = [...projects[proj_key]["keywords"]];

        // show this project in search result
        var main_key = '.' + proj_key;
        $(main_key).css('display', 'block');

        // highlight any matches in title or summary
        for (var wi=0; wi<words.length; wi++){
            var word = words[wi];
            title = highlightQuery(title, word, is_title=true);
            for (var ki=0;ki<keywords.length;ki++) {
                keywords[ki] = highlightQuery(keywords[ki], word);
            }
        }
        var div = document.getElementById(proj_key);
        var link = $("#" + proj_key).children()[0].href;
        div.innerHTML = `
            <a id='link' href=${link}> ${title} </a>
            <p>${keywords.join(", ")}</p>`;
        // console.log(div.innerHTML);
    }
};

function highlightQuery(text, query, is_title=false) {
    // highlight matches and return some words for context around match
    const regex = new RegExp(query, "gi");
    var new_text = text.replace(regex, (match) => `<mark>${match}</mark>`);
    console.log(query);
    console.log(text);
    return new_text;
}

$(document).ready(function(){
    var projects;
    var synch = false;
    $.getJSON( 'https://alvinosaur.github.io/AboutMe/js/projects.json', function( data ) {
        projects = data;
        synch = true;
    });
    

    // after each keypress
    if (synch) {
        console.log(projects);
        $(".form-control").keyup(function(event) {
            var entry = $(this).val();
            console.log("Typed: " + entry);
            // filter out any whitespace
            var words = entry.split(/(\s+)/).filter(
                function(e) { return e.trim().length > 0; } );

            searchProjects(words, projects);
        });
    }
});