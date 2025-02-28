package com.devexp.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LoginDTOTest {

	@Test
	void testJsonDeserialization() throws Exception {
	    String json = "{ \"email\": \"joao.silva@example.com\", \"password\": \"123456\" }";

	    ObjectMapper objectMapper = new ObjectMapper();
	    LoginDTO loginDTO = objectMapper.readValue(json, LoginDTO.class);

	    System.out.println("Email: " + loginDTO.getEmail()); // Depuração
	    System.out.println("Password: " + loginDTO.getPassword());

	    assertNotNull(loginDTO);
	    assertNotNull(loginDTO.getEmail());
	    assertNotNull(loginDTO.getPassword());
	}

}
