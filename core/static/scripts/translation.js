 $(document).click(function(){
        var s = window.getSelection();
        s.modify('extend','backward','word');        
        var b = s.toString();

        s.modify('extend','forward','word');
        var a = s.toString();
        s.modify('move','forward','character');
        var selection = b+a;
        console.log(selection+'\nSessionID:'+sessionID);
 });

