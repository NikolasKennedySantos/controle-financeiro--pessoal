package com.nikolas.financeiro.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nikolas.financeiro.model.Transacao;

public interface TransacaoRepository extends JpaRepository<Transacao, Long>{
	
}
