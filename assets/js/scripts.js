var Tokens = [];
var Estados = [[]];
var EstadoGlobal = 0;
var EstadoIteracao = [0];
var Tabela = [];

function insereToken(){
	var token = $("#input-insere").val();
	if(token) { //Testa se tem algo escrito(válido)
		if (Tokens.indexOf(token) < 0 && token.length > 0) { //Testa se ja existe a palavra no dicionário
			$("#table-tokens").append("<tr><td>"+token+"</td><td><span class='badge badge-danger badge-icon' onclick=\"removeToken('"+token+"')\"><i class='fa fa-times' aria-hidden='true'></i><span>Remover</span></span></td></tr>")
			Tokens.push(token);
			$("#input-insere").val("");
		}
	}
	monta_estados();
	Tabela = gerar_linhas();
	tabela_para_html(Tabela);

	$('#buscar').keyup(function(e){
		if(Tabela.length > 0){
			valida_palavra(e);
		}
	});
}

function removeCaracteres(){
	var token = $("#input-insere").val();
	if (token.slice(-1) == " ") {
		$("#input-insere").val(token.replace(' ', ''));
	}
}

function removeToken(token){
	alert(token);
}

/*
	Esta função monta os estados a partir das palavras adicionadas ao discionário
*/
function monta_estados(){
	for (var i = 0; i < Tokens.length; i++) {
		var estado_atual = 0;
		var palavra_vetor = Tokens[i];
		for(var j = 0; j < palavra_vetor.length; j++){
			if(typeof Estados[estado_atual][palavra_vetor[j]] === 'undefined'){
				var proximo_estado = EstadoGlobal + 1;
				Estados[estado_atual][palavra_vetor[j]] = proximo_estado;
				Estados[proximo_estado] = [];
				EstadoGlobal = estado_atual = proximo_estado;
			} else {
				estado_atual = Estados[estado_atual][palavra_vetor[j]];
			}

			if(j == palavra_vetor.length - 1){
				Estados[estado_atual]['final'] = true;
			}
		};
	};
}

// monta a tabela do autômato
function gerar_linhas(){
	var vetor_estados = [];
	for (var i = 0; i < Estados.length; i++) {
		var aux = [];
		aux['estado'] = i;
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			if(typeof Estados[i][letra] === 'undefined'){
				aux[letra] = '-'
			} else {
				aux[letra] = Estados[i][letra]
			}
		}
		if(typeof Estados[i]['final'] !== 'undefined'){
			aux['final'] = true;
		}
		vetor_estados.push(aux);
	};
	console.log(vetor_estados);
	return vetor_estados;
}

function tabela_para_html(vetor_estados){
	tabela = $('#automato');
	tabela.html('');
	// Define o cabeçalho da tabela
	var tr = $( document.createElement('tr') );
	var th = $( document.createElement('th') );
	th.html('Estado'); // Adiciona o titulo da coluna de estado
	tr.append(th);
	var primeiro = 'a';
	var ultimo = 'z';
	for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) { // Adiciona todas as letras no cabeçalho da tabela
		var th = $( document.createElement('th') );
		th.html(String.fromCharCode(j));
		tr.append(th);
	}
	tabela.append(tr);

	// Itera entre os estados
	for(var i = 0; i < vetor_estados.length; i++){
		var tr = $( document.createElement('tr') ); // Cria uma nova linha para cada estado
		var td = $( document.createElement('td') ); // Cria a celula do estado
		if(vetor_estados[i]['final']){
			td.html('q' + vetor_estados[i]['estado'] + '*');
		} else {
			td.html('q' + vetor_estados[i]['estado']);
		}
		tr.append(td);
		tr.addClass('estado_'+vetor_estados[i]['estado']);
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			var td = $( document.createElement('td') );
			td.addClass('letra_'+letra);
			if(vetor_estados[i][letra] != '-'){
				td.html('q' + vetor_estados[i][letra]);
			}
			tr.append(td);
		}
		tabela.append(tr);
	}
}

// Valida as entradas vindas do campo de digitação
function valida_palavra(event){
	var primeiro = 'a'; // Para saber se o que está digitado é válido
	var ultimo = 'z';
	var palavras = $('#buscar').val(); // Pega o valor do campo
	if(palavras.length == 0){ // Verifica se o campo está vazio, assim ele reseta todos os efeitos na tabela
		$('#buscar').removeClass('acerto');
		$('#buscar').removeClass('erro');
		$('#automato tr').removeClass('estado_selecionado');
		$('#automato td').removeClass('letra_selecionada');
	}
	var estado = 0; // Inicia a verificação pelo estado inicial
	for (var i = 0; i < palavras.length; i++) {
		// Verifica se o dígito está entre a - z
		if(palavras[i].charCodeAt(0) >= primeiro.charCodeAt(0) && palavras[i].charCodeAt(0) <= ultimo.charCodeAt(0)){
			highlightState(estado, palavras[i]);
			if(Tabela[estado][palavras[i]] != '-'){ // se o estado não for de erro, ele aceita
				estado = Tabela[estado][palavras[i]];
				inAccept();
			} else { // Rejeita caso o estado seja de erro
				inError();
				break;
			}
		} else if(palavras[i] == ' '){ // Caso tenha digitado um espaço
			$('#buscar').val("");
		} else {
			alert('Caractere fora da extensão: ' + palavras[i]); // Se for digitado um caractere fora do epaço de a até z ele dá mensagem dizend oque é inválido
			break;
		}
	};
}

function inError(){
	$('#buscar').removeClass('acerto');
	$('#buscar').addClass('erro');
}
function inAccept(){
	$('#buscar').addClass('acerto');
	$('#buscar').removeClass('erro');
}

function highlightState(state, letter){
	$('#automato tr').removeClass('estado_selecionado');
	$('#automato td').removeClass('letra_selecionada');
	$('#automato .estado_' + state).addClass('estado_selecionado');
	$('#automato .letra_' + letter).addClass('letra_selecionada');
}