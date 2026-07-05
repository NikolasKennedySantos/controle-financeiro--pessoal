package com.nikolas.financeiro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikolas.financeiro.model.Transacao;
import com.nikolas.financeiro.repository.TransacaoRepository;

@RestController
@RequestMapping("/transacoes")
@CrossOrigin(origins = "*")
public class TransacaoController {
	@Autowired
	private TransacaoRepository repository;

	@GetMapping
	public ResponseEntity<List<Transacao>> listarTodas() {
		List<Transacao> transacoes = repository.findAll();
		return ResponseEntity.ok(transacoes);
	}

	@PostMapping
	public ResponseEntity<Transacao> salvar(@RequestBody Transacao transacao) {
		System.out.println("POST chamado");
		return ResponseEntity.ok(repository.save(transacao));

	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id) {
		repository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{id}")
	public ResponseEntity<Transacao> atualizar(@PathVariable Long id, @RequestBody Transacao transacao) {
		System.out.println("PUT chamado. ID = " + id);

		transacao.setId(id);

		return ResponseEntity.ok(repository.save(transacao));
	}
}
