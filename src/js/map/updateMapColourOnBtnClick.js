export default function(texts, paths, fill) {
    
    let btns = document.querySelectorAll(".btn");
    btns.forEach(btn => btn.addEventListener("click", redraw));

    function redraw(e) {
        let who = e.target;
        let type = who.getAttribute("data-type");
        
        paths.attr("fill", d =>
            fill(d.count[type].rateFail)
        );
    
        texts.attr("fill", d => 
            d.count[type].rateFail > 0.2 ? 
            "#333" : "transparent"
        );
    }
}
