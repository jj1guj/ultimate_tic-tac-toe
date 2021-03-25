class Board{
    constructor(){
        this.board=[];
        this.board_min=[];
        this.disposition=[];
        this.turn=false;//true: 後手
        this.init();
    }

    init(){
        for(var i=0;i<9;++i){
            let boardline=[];
            for(var j=0;j<9;++j)boardline.push(0);
            this.board.push(boardline);
        }
        for(var i=0;i<3;++i){
            var disposition_line=[];
            var board_min_line=[];
            for(var j=0;j<3;++j){
                disposition_line.push(0);
                var bmin=[];
                for(var k=0;k<3;++k){
                    var bmin_line=[];
                    for(var l=0;l<3;++l)bmin_line.push(0);
                    bmin.push(bmin_line);
                }
                board_min_line.push(bmin);
            }
            this.disposition.push(disposition_line);
            this.board_min.push(board_min_line);
        }
    }

    is_gameover(){
        return this.is_gameover_min(this.disposition);
    }

    is_gameover_min(board){
        for(var i=0;i<3;++i){
            let count_sente =board[i].filter(function(x){return x===1}).length;
            let count_gote=board[i].filter(function(x){return x===-1}).length;
            if(count_sente==3)return 1;
            else if(count_gote==3)return -1;
    
            var C=[];
            for(var j=0;j<3;++j)C.push(board[j][i]);
            count_sente =C.filter(function(x){return x===1}).length;
            count_gote=C.filter(function(x){return x===-1}).length;
            if(count_sente==3)return 1;
            else if(count_gote==3)return -1;
        }
        var C=[];
        for(var i=0;i<3;++i)C.push(board[i][i]);
        var count_sente =C.filter(function(x){return x===1}).length;
        var count_gote=C.filter(function(x){return x===-1}).length;
        if(count_sente==3)return 1;
        else if(count_gote==3)return -1;
    
        C=[];
        for(var i=0;i<3;++i)C.push(board[2-i][i]);
        count_sente =C.filter(function(x){return x===1}).length;
        count_gote=C.filter(function(x){return x===-1}).length;
        if(count_sente==3)return 1;
        else if(count_gote==3)return -1;
        var ref=9;
        for(var i=0;i<3;++i)for(var j=0;j<3;++j)if(board[i][j]==0)--ref;
        if(ref==9)return 2;
        return 0;
    }

    push(id){
        var row=Math.floor(id/9);
        var col=id%9;
        var put=1;
        if(this.turn){
            put=-1;
        }else{
            put=1;
        }
        this.board[row][col]=put;
        this.board_min[Math.floor(row/3)][Math.floor(col/3)][row%3][col%3]=put;
        this.turn=!this.turn;
        this.disposition[Math.floor(row/3)][Math.floor(col/3)]=this.is_gameover_min(this.board_min[Math.floor(row/3)][Math.floor(col/3)]);
    }

    pop(id){
        var row=Math.floor(id/9);
        var col=id%9;
        this.board[row][col]=0;
        this.board_min[Math.floor(row/3)][Math.floor(col/3)][row%3][col%3]=0;
        this.turn=!this.turn;
        this.disposition[Math.floor(row/3)][Math.floor(col/3)]=this.is_gameover_min(this.board_min[Math.floor(row/3)][Math.floor(col/3)]);
    }
}

function legalMoveList(B,id){
    var row=Math.floor(id/9);
    var col=id%9;
    var mrow=row%3;
    var mcol=col%3;
    var L=[];
    if(id<0||B.disposition[mrow][mcol]!=0){
        for(var i=0;i<9;++i)for(var j=0;j<9;++j)if(B.board[i][j]==0){
            if(B.disposition[Math.floor(i/3)][Math.floor(j/3)]==0){
                L.push(9*i+j);
            }
        }
    }else if(B.disposition[mrow][mcol]==0){
        for(var i=0;i<3;++i)for(var j=0;j<3;++j){
            if(B.board_min[mrow][mcol][i][j]==0){
                var r=3*mrow+i;
                var c=3*mcol+j;
                L.push(9*r+c);
            }
        }
    }
    return L;
}

function point_policy(row){
    var pointl={2:100000,1:500};
    var count_sente =row.filter(function(x){return x===1}).length;
    var count_gote =row.filter(function(x){return x===-1}).length;
    if((count_sente==1 && count_gote==0)||
    (count_sente==0 && count_gote==1)){
        return pointl[1];
    }
    if((count_sente==2 && count_gote==0)||
    (count_sente==0 && count_gote==2)){
        return pointl[2];
    }
    return 0;
}

function eval_policy(board){
    var out=[];
    var p;
    for(i=0;i<3;++i){
        var out_line=[];
        for(j=0;j<3;++j){
            var C=[];
            for(k=0;k<3;++k)C.push(board[k][j]);
            p=point_policy(board[i])+point_policy(C);
            if(i==j){
                C=[];
                for(k=0;k<3;++k)C.push(board[k][k]);
                p+=point_policy(C);
            }
            if(i+j==2){
                C=[];
                for(k=0;k<3;++k)C.push(board[2-k][k]);
                p+=point_policy(C);
            }
            out_line.push(p);
        }
        out.push(out_line);
    }
    return out;
}

//置ける場所の数の評価値(合法手数×1で出力)
function eval_space(B,id){
    B.push(id);
    var out=81-legalMoveList(B,id).length;
    B.pop(id);
    return out;
}

function evaluate(B){
    var val=[];
    for(i=0;i<9;++i){
        var val_line=[];
        for(j=0;j<9;++j)val_line.push(0);
        val.push(val_line);
    }
    var priority=eval_policy(B.disposition);

    for(i=0;i<3;++i)for(j=0;j<3;++j){
        var val_min=eval(B.board_min[i][j]);
        if(priority[i][j]==0 && B.disposition[i][j]==0){
            priority[i][j]=1;
        }
        for(k=0;k<3;++k)for(l=0;l<3;++l){
            val[3*i+k][3*j+l]=val_min[k][l];
        }
    }

    for(i=0;i<9;++i)for(j=0;j<9;++j){
        val[i][j]*=priority[Math.floor(i/3)][Math.floor(j/3)];
    }
    
    return val;
}

function movebyAI(B,id){
    var pointL=[];
    var val=evaluate(B);
    var moveL=legalMoveList(B,id);
    for(var i=0;i<moveL.length;++i){
        var row=Math.floor(moveL[i]/9);
        var col=moveL[i]%9;
        var point=val[row][col]+eval_space(B,moveL[i]);
        pointL.push(point);
    }
    var pmax=Math.max(...pointL);
    for(i=0;i<moveL.length;++i)if(pointL[i]==pmax){
        return moveL[i];
    }
}

var human=true;
var B=new Board();
var last_move=-1;

//盤面の生成
var table=document.createElement('table');

for(var i=0; i<9;++i){
    var tr=document.createElement('tr');
    for(var j=0;j<9;++j){
        var td=document.createElement('td');
        td.addEventListener('click',makeMove);
        td.setAttribute('id',9*i+j);
        tr.appendChild(td);
    }
    table.appendChild(tr);
}

document.getElementById('board').appendChild(table);

function makeMove(){
    id=Number(this.getAttribute('id'));
    if(!legalMoveList(B,last_move).includes(id)||B.turn!=human)return;
    move(id);
}

function move(id){
    if(B.turn)put="o";
    else put="x";
    if(last_move>=0){
        document.getElementById(last_move).style.backgroundColor="#FFFFFF";    
    }
    document.getElementById(id).style.background="#FA8072";
    document.getElementById(id).textContent=put;
    if(B.is_gameover()!=0){
        var return_val=B.is_gameover();
        if(return_val==-1){
            alert("後手勝ち");
        }else if(return_val==1){
            alert("先手勝ち");
        }else{
            alert("引き分け");
        }
    }
    B.push(id);
    last_move=id;
    if(B.turn!=human){
        move(movebyAI(B,last_move));
    }
}

if(B.turn!=human){
    move(movebyAI(B,last_move));
}