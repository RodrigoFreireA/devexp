package com.devexp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Configuration
@ComponentScan(basePackages = "com.devexp")
@EnableJpaRepositories(basePackages = "com.devexp.repositories")
@EntityScan(basePackages = "com.devexp.models")
public class SpringConfig {
} 