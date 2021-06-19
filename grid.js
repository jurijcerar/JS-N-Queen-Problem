function heuristic(queens){
    var h;
    h = 0;
    for(var i = 0; i < queens.length; i++){
        for(var j = i+1; j < queens.length; j++){
            if(queens[i].x == queens[j].x || queens[i].y == queens[j].y || Math.abs(queens[i].x - queens[j].x) == Math.abs(queens[i].y - queens[j].y)){
                h++;
            }
        }
    }
    return h;
}

function develop(queens,n){
    var developed = [];
    for (var i = 0; i < n; i++){
        let copy_queens = JSON.parse(JSON.stringify(queens));
        var pos =  Math.floor(Math.random() * queens.length);
        var move = Math.floor(Math.random() * queens.length);
        copy_queens[pos].y = move;
        developed.push(copy_queens);
    }
    return developed;
}

function min_heuristic(developed){
    var min = 1000;
    var j = 0;
    for(var i = 0; i < developed.length; i++){
        let h = heuristic(developed[i]);
        if(h < min){
            min = h;
            j = i; 
        }
    }
    return developed[j];
}

function hill_climb(queens,n) {
    var move = 0;
    var legal_moves = 0;
    var developed = [];
    while(legal_moves < n && heuristic(queens) != 0){
        developed = develop(queens,queens.length);
        let new_queens = min_heuristic(developed);
        if(heuristic(new_queens) <= heuristic(queens)){
            queens = new_queens;
            if(heuristic(new_queens) == heuristic(queens)){
                legal_moves++;
            }
            else{
                legal_moves = 0;
            }
        }
        else{
            legal_moves = 0;
        }
        move++;
    }
    return {arr:queens, moves:move};
}

function simulated_annealing (queens, start_temp, change_temp){
    var developed = [];
    var move = 0;
    var max_temp = start_temp;
    while(start_temp != 0 && heuristic(queens) != 0){
        developed = develop(queens,queens.length);
        var rand_queen = Math.floor(Math.random() * queens.length);
        let new_queens = developed[rand_queen];
        var delta_heuristic = heuristic(queens) - heuristic(new_queens);
        if(delta_heuristic > 0){
            queens = new_queens;
        }
        else{
            var a = Math.random();
            var b = Math.pow(Math.E,delta_heuristic/start_temp);
            var sum = 0;
            for (var i = 0; i < queens.length;i++){
                sum = sum + i;
            }
            b = b / Math.pow(Math.E,sum/max_temp);
            if(b > a){
                queens = new_queens;
            }
        }
        start_temp = start_temp - change_temp;
        move ++
    }
    return {arr:queens, moves:move};
}

function sort(developed){
    var heuristics = [];
    for (var i = 0; i < developed.length; i++){
        heuristics.push(heuristic(developed[i]));
    }
    for (var i = 0; i < heuristics.length-1; i++){
        for (var j = 0; j < heuristics.length-i-1; j++){
            if(heuristics[j]>heuristics[j+1]){
                [heuristics[j], heuristics[j+1]] = [heuristics[j+1], heuristics[j]];
                [developed[j], developed[j+1]] = [developed[j+1], developed[j]];
            }
        }
    }
}

function check_heuristic(developed){
    for (let index = 0; index < developed.length; index++) {
        if(heuristic(developed[index]) == 0){
            return true;
        }      
    }
    return false;
}

function local_beam_search (queens,instance,max) {
    var q = [];
    var moves = 0;
    var min = 100;
    var legal_moves = 0;
    var developed = develop(queens,instance);
    while(!check_heuristic(developed) && moves < max){
        sort(developed);
        q = JSON.parse(JSON.stringify(developed));
        for (let index = 0; index < developed.length; index++) {
            let e = develop(developed[index],instance);
            q = q.concat(e);    
        }
        sort(q);
        developed = [];
        for (let index = 0; index < instance; index++) {
            developed.push(q[index]);
        }
        moves++;
        if(min_heuristic(developed) == min){
            legal_moves++;
        }
        else{
            min = min_heuristic(developed);
            legal_moves = 0;
        }
    }
    queens = min_heuristic(developed);
    return {arr:queens, moves:moves};
}

function selection(developed){
    var j = Math.floor(Math.random() * developed.length);
    return developed[j];
    /*var i = 0;
    var sum = 0;
    for (var j = 0; j < developed.length; j++){
        sum = sum + heuristic(developed[j]);
    }
    var a = Math.floor(Math.random() * sum);
    sum = 0;
    while(sum < a){
        sum = sum + heuristic(developed[i]);
        i++;
    }
    return developed[i];*/
}

function crossing(c1,c2,b){
    var a = Math.random();
    var d1 = JSON.parse(JSON.stringify(c1));
    var d2 = JSON.parse(JSON.stringify(c2));
    var i = Math.floor(Math.random() * c1.length);
    var j = Math.floor(Math.random() * c1.length);
    if(b > a){
        [d1[i],  d2[i]] = [d2[i], d1[i]];
        [d1[j],  d2[j]] = [d2[j], d1[j]];
    }
    return {c1:d1,c2:d2};
}

function mutation(c1,c2,m){
    var a = Math.random();
    var d1 = JSON.parse(JSON.stringify(c1));
    var d2 = JSON.parse(JSON.stringify(c2));
    if(m > a){
        var i = Math.floor(Math.random() * c1.length);
        var j = Math.floor(Math.random() * c1.length);
        d1[i].y = Math.floor(Math.random() * c1.length);
        d2[j].y = Math.floor(Math.random() * c1.length);
    }
    return {c1:d1,c2:d2};
}

function genetic_algorithm (queens,size,percentage,prob_b,prob_m,gen) {
    var moves = 0;
    var temp = develop(queens,size);
    var developed = JSON.parse(JSON.stringify(temp));
    while(moves < gen){
        moves++;
        sort(developed);
        var c = JSON.parse(JSON.stringify(developed[0]));
        if(heuristic(c) == 0){
            return {arr:c, moves:moves};;
        }
        var q = [];
        var elite = (developed.length*percentage)/100;
        for (let index = 0; index < elite; index++) {
            var t = JSON.parse(JSON.stringify(developed[index]));
            q.push(t);
        }
        while(q.length < developed.length){
            var c1 = selection(developed);
            var c2 = selection(developed);
            var n = crossing(c1,c2,prob_m);
            c1 = n.c1;
            c2 = n.c2;
            n = mutation(c1,c2,prob_m);
            c1 = n.c1;
            c2 = n.c2;
            q.push(c1);
            q.push(c2);
        }
        if(q.length != developed.length){
            q.pop();
        }
        developed = q;
    }
    return {arr:c, moves:moves};;
}

function solved (){

    var queens = temp;
    var obj = genetic_algorithm(queens,100,20,0.35,0.05,1000);
    var solution = obj.arr;
    var moves = obj.moves;

    var alg = document.querySelector('input[name="algorithm"]:checked').value;
    var a=1,b=1,c=1,d=1,e=1;

    if(alg=="HC"){
        a = document.getElementById("HC_input").value;
        var obj = hill_climb(queens,a);
        var solution = obj.arr;
        var moves = obj.moves;
    }
    else if(alg=="SA"){
        a = document.getElementById("SA_input1").value;
        b = document.getElementById("SA_input2").value;
        var obj = simulated_annealing(queens,a,b);
        var solution = obj.arr;
        var moves = obj.moves;
    }
    else if(alg=="LBS"){
        a = document.getElementById("LBS_input1").value;
        b = document.getElementById("LBS_input2").value;
        var obj = local_beam_search(queens,a,b);
        var solution = obj.arr;
        var moves = obj.moves;
    }
    else if(alg=="GA"){
        a = document.getElementById("GA_input1").value;
        b = document.getElementById("GA_input2").value;
        c = document.getElementById("GA_input3").value;
        d = document.getElementById("GA_input4").value;
        e = document.getElementById("GA_input5").value;
        var obj = genetic_algorithm(queens,a,b,c,d,e);
        var solution = obj.arr;
        var moves = obj.moves;
    }

    a = parseInt(a);
    b = parseInt(b);
    c = parseFloat(c);
    d = parseFloat(d);
    e = parseInt(e);

    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || isNaN(e)){
        alert("Niste vnesli vseh vrednosti !");
    }
    else{

        let tableString = "<table>";
        
        for (var row = 0; row < solution.length; row += 1) {
        
            tableString += "<tr>";
        
            for (var col = 0; col < solution.length; col += 1) {
                tableString += `<td class="${col % 2 === row % 2 ? 'even' : 'odd'}">`;
                for (var i = 0; i < solution.length; i++){
                    if(row == solution[i].x && col == solution[i].y){
                        tableString += "<img src ='queen.png'>"
                    }
                }
                tableString += "</td>";

            }
            tableString += "</tr>";
        }
        
        tableString += "</table>";
        let h = heuristic(solution);
        document.getElementById("heu").innerHTML = `Hevristika: ${h}`;
        document.getElementById("move").innerHTML = `Število korakov: ${moves}`;
        const tableDiv = document.getElementById('tableDiv');
        tableDiv.innerHTML = tableString;
        console.log(alg);
    }
}
var temp;
function create_table(){

    var e = document.getElementById("dimensions");
    var dimensions =  e.value;
    var queens = [];

    let tableString = "<table>";
    
    for (var row = 0; row < dimensions; row += 1) {
    
        tableString += "<tr>";

        var queen = Math.floor(Math.random() * dimensions);
    
        for (var col = 0; col < dimensions; col += 1) {
            tableString += `<td class="${col % 2 === row % 2 ? 'even' : 'odd'}"><img src ="${col === queen ? 'queen.png' : ''}"></td>`;
            if(col == queen){
                var q = {x : row, y : col};
                queens.push(q);
            }
        }
        tableString += "</tr>";
    }
    
    tableString += "</table>";
    let h = heuristic(queens);
    document.getElementById("heu").innerHTML = `Hevristika: ${h}`;
    document.getElementById("move").innerHTML = `Število korakov: 0`;
    const tableDiv = document.getElementById('tableDiv');
    tableDiv.innerHTML = tableString;
    temp = queens;
}

    