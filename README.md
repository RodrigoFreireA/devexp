# DevExp - Rede Social para Desenvolvedores

DevExp é uma rede social projetada especificamente para desenvolvedores compartilharem conhecimento, código e experiências. A plataforma permite que desenvolvedores de diferentes níveis (Júnior, Pleno e Sênior) interajam, compartilhem snippets de código e construam uma comunidade de aprendizado.

## 🚀 Funcionalidades

- **Autenticação**
  - Login e registro de usuários
  - Autenticação via JWT
  - Níveis de acesso (usuário comum e admin)

- **Posts**
  - Criação de posts com suporte a código
  - Syntax highlighting para múltiplas linguagens
  - Temas claro e escuro para visualização de código
  - Sistema de curtidas e comentários
  - Exclusão de posts (pelo autor ou admin)

- **Perfil**
  - Perfil personalizado com informação profissional
  - Integração com avatar do GitHub
  - Nível de experiência (Júnior, Pleno, Sênior)
  - Edição de informações do perfil

- **Feed**
  - Feed de posts em tempo real
  - Filtro de desenvolvedores por nível de experiência
  - Lista de desenvolvedores em trending
  - Sistema de paginação

## 🛠️ Tecnologias

### Backend
- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- JPA/Hibernate
- MySQL

### Frontend
- React
- Material-UI
- React Router
- Axios
- react-syntax-highlighter

## 📦 Instalação

### Pré-requisitos
- Java 17
- Node.js
- MySQL

### Backend

1. Clone o repositório
```bash
git clone git@github.com:RodrigoFreireA/devexp.git
cd devexp
```

2. Configure o banco de dados no `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/devexp
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

3. Execute o backend
```bash
./mvnw spring-boot:run
```

### Frontend

1. Navegue até a pasta do frontend
```bash
cd frontend
```

2. Instale as dependências
```bash
npm install
```

3. Execute o frontend
```bash
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

Backend (`application.properties`):
```properties
jwt.secret=seu_jwt_secret
jwt.expiration=86400000
```

Frontend (`.env`):
```env
REACT_APP_API_URL=http://localhost:8080
```

## 📝 Uso

1. Registre-se na plataforma
2. Complete seu perfil com informações profissionais
3. Comece a compartilhar conhecimento através de posts
4. Interaja com outros desenvolvedores através de curtidas e comentários

## 📸 Telas da Aplicação

<p align="center">
  <img src="https://github.com/user-attachments/assets/74d1a09b-b80a-4ceb-9740-f905a57c551b" width="250">
  <img src="https://github.com/user-attachments/assets/63a3f8fe-d5c7-4076-ab4b-b768364767cf" width="250">
  <img src="https://github.com/user-attachments/assets/5ec5a385-a1da-4f74-ac49-e318e829a631" width="250">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/2c9f972a-1c29-4a9e-aa8a-1b7e608a0923" width="250">
  <img src="https://github.com/user-attachments/assets/071cd555-ab00-486f-a4e0-e8502926c563" width="250">
</p>



## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Status do Projeto

O projeto está em desenvolvimento ativo. Novas funcionalidades estão sendo adicionadas regularmente.

## 📫 Contato

Rodrigo Freire - [GitHub](https://github.com/RodrigoFreireA) 
