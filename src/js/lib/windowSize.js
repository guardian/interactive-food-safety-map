export function getWindowSize() {
    let w = window;
    let d = document;
    let e = d.documentElement;
    let g = d.getElementsByTagName('body')[0];
    
    let width = w.innerWidth || e.clientWidth || g.clientWidth;
    let height = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
    return {width, height};
}
