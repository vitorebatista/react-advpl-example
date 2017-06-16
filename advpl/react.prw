#include "TOTVS.CH"

/*/	-----------------------------------------------------------------/
Exemplo para montagem de um componente hibrido AdvPL/HTML
/-------------------------------------------------------------------*/
User function React()
local i, oDlg, cFile, nHandle, globalLink
local aFiles := {"bootstrap.min.css",;
				"jquery-1.10.2.min.js",;
				"totvstec.js",;
				"style.css",;
				"component.html",;
				"img_avatar1.png",;
				"img_avatar2.png",;
				"img_avatar3.png",;
				"img_avatar4.png",;
				"img_avatar5.png",;
				"img_avatar6.png"}
private tempPath := 'C:\Temp\handson\fontes\react\build\'//GetTempPath()
private oWebChannel, oMultGet, oCompHTML
Private nItem := 0

oDlg := TWindow():New(10, 10, 800, 600, "TOTVS - Demonstracao de componente Hibrido")
oDlg:setCss("QPushButton{borderDummy: 1px solid black;}")

    // [Android] retorna mesmo tipo do Linux
    if GetRemoteType() == 2
    	oMobile := TMobile():New()
    	oMobile:SetScreenOrientation(-1)
    	tempPath := oMobile:GetTempPath() + "/"
    endif             
/*
	// Baixa arquivos HTML do RPO no TEMP
	for i := 1 to len(aFiles)
		cFile :=  + aFiles[i]
		nHandle := fCreate(tempPath+cFile)
		fWrite(nHandle, getApoRes(aFiles[i]))
        fClose(nHandle)
	next i
*/	
	// Painel de botoes
    @ 000, 000 MSPANEL pLeft SIZE 092, 400 OF oDlg COLORS 0, 16777215 RAISED
    @ 000, 000 BUTTON oButton2 PROMPT "Abre Janela" SIZE 091, 012 OF pLeft PIXEL; 
       ACTION ( OpenWindow() ) 
	@ 000, 000 BUTTON oButton3 PROMPT "Fecha Janela" SIZE 091, 012 OF pLeft PIXEL; 
		ACTION ( CloseWindow() ) 
    @ 013, 000 BUTTON oButton4 PROMPT "Adiciona item" SIZE 091, 012 OF pLeft PIXEL;
       ACTION ( AddItem() ) 

    // TWebChannel eh responsavel pelo trafego SmartClient/HTML
    oWebChannel := TWebChannel():New(9999)
	oWebChannel:nPort := 9999
    oWebChannel:connect(9999)
    if !oWebChannel:lConnected
    	msgStop("Erro na conexao com o WebSocket")
    	return
    endif
    oWebChannel:nPort := 9999
	conout(oWebChannel:nPort)
	
    // IMPORTANTE: Aqui definimos a porta WebSocket que sera utilizada
    globalLink := "localhost:3000/?port=" + cValToChar(oWebChannel:nPort)
       
    // Toda acao JavaScript enviada atraves do comando dialog.jsToAdvpl()
    // serah recebida/tratada por esta bloco de codigo
	oWebChannel:bJsToAdvpl := {|self,codeType,codeContent|;
	   jsToAdvpl(self,codeType,codeContent) } 
	
	// Componente que sera utilizado como Navegador embutido
	oCompHTML := TWebEngine():New(oDlg, 0, 0, 100, 100)
		
		oCompHTML:navigate(globalLink)
    
    pLeft:Align := CONTROL_ALIGN_LEFT
    oButton2:Align := CONTROL_ALIGN_TOP
    oButton3:Align := CONTROL_ALIGN_TOP
	oButton4:Align := CONTROL_ALIGN_TOP
	oCompHTML:Align := CONTROL_ALIGN_ALLCLIENT
    
    
oDlg:Activate("MAXIMIZED")
Return

/*/	-----------------------------------------------------------------/
Bloco de codigo que recebera as chamadas JavaScript
/-------------------------------------------------------------------*/
static function jsToAdvpl(self,codeType,codeContent)
	// Exibe mensagens trocadas
	conout("jsToAdvpl->codeType: " + codeType +chr(10)+;
		   "jsToAdvpl->codeContent: " + codeContent)
			

	// Termino da carga da pagina HTML
	if codeType == "pageStarted"
		conout("Terminou de carregar página HTML")
		//oWebChannel:advplToJs("js", cFunction)	
	endif
	
return


Static Function OpenWindow()
Return oWebChannel:advplToJs("OpenWindow", "")


Static Function CloseWindow()
Return oWebChannel:advplToJs("CloseWindow", "")

Static Function AddItem()
	Local cItem := cValToChar(nItem)
	Local cJson := '{"item": "'+cItem+'", "name": "Item '+cItem+'" }'
	nItem++
	oWebChannel:advplToJs("AddItem", cJson)
Return