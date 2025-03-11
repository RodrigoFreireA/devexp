package com.devexp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        try {
            logger.info("Iniciando envio de email para: {}", to);
            logger.debug("Token de verificação: {}", token);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("devexpm@gmail.com"); // Adiciona o remetente explicitamente
            message.setTo(to);
            message.setSubject("Verificação de E-mail - DevExp");
            message.setText("Olá! Para verificar seu e-mail, clique no link abaixo:\n\n" +
                    "http://localhost:3000/verify-email?token=" + token + "\n\n" +
                    "Se você não solicitou esta verificação, por favor ignore este e-mail.");
            
            logger.debug("Configurações do email:\nDe: {}\nPara: {}\nAssunto: {}", 
                message.getFrom(), message.getTo(), message.getSubject());
            
            mailSender.send(message);
            logger.info("Email enviado com sucesso para: {}", to);
            
        } catch (Exception e) {
            logger.error("Erro ao enviar email para: {}", to, e);
            logger.error("Detalhes do erro: {}", e.getMessage());
            throw new RuntimeException("Falha ao enviar email de verificação", e);
        }
    }
} 