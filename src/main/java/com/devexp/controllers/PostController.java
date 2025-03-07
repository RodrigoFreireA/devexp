package com.devexp.controllers;

import com.devexp.dto.PostDTO;
import com.devexp.dto.UserDTO;
import com.devexp.dto.CommentDTO;
import com.devexp.models.Post;
import com.devexp.models.User;
import com.devexp.models.Comment;
import com.devexp.repositories.PostRepository;
import com.devexp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody Map<String, Object> payload) {
        try {
            Long authorId = Long.parseLong(payload.get("authorId").toString());
            String title = payload.get("title").toString();
            String content = payload.get("content").toString();
            String code = payload.getOrDefault("code", "").toString();
            String language = payload.getOrDefault("language", "text").toString();
            String theme = payload.getOrDefault("theme", "light").toString();

            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);
            post.setCode(code);
            post.setLanguage(language);
            post.setTheme(theme);
            post.setAuthor(author);
            
            Post savedPost = postRepository.save(post);
            return ResponseEntity.ok(convertToDTO(savedPost));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post não encontrado"));

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Verifica se o usuário é admin ou dono do post
            boolean isAdmin = currentUser.getRoles().stream()
                    .anyMatch(role -> role.toString().equals("ROLE_ADMIN"));
            boolean isAuthor = post.getAuthor().getId().equals(currentUser.getId());

            if (!isAdmin && !isAuthor) {
                return ResponseEntity.status(403).body("Não autorizado");
            }

            postRepository.delete(post);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post não encontrado"));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (post.getLikes().contains(user)) {
                post.getLikes().remove(user);
            } else {
                post.getLikes().add(user);
            }

            postRepository.save(post);
            return ResponseEntity.ok(convertToDTO(post));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            String content = payload.get("content").toString();
            
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Post não encontrado"));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Comment comment = new Comment();
            comment.setContent(content);
            comment.setAuthor(user);
            comment.setPost(post);
            
            post.getComments().add(comment);
            postRepository.save(post);
            
            return ResponseEntity.ok(convertToDTO(post));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCode(post.getCode());
        dto.setLanguage(post.getLanguage());
        dto.setTheme(post.getTheme());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setLikesCount(post.getLikes().size());
        dto.setCommentsCount(post.getComments().size());
        
        if (post.getAuthor() != null) {
            UserDTO authorDTO = new UserDTO();
            authorDTO.setId(post.getAuthor().getId());
            authorDTO.setName(post.getAuthor().getName());
            authorDTO.setAvatar(post.getAuthor().getAvatar());
            authorDTO.setExperienceLevel(post.getAuthor().getExperienceLevel());
            dto.setAuthor(authorDTO);
        }

        // Converter comentários
        List<CommentDTO> commentDTOs = post.getComments().stream()
            .map(comment -> {
                CommentDTO commentDTO = new CommentDTO();
                commentDTO.setId(comment.getId());
                commentDTO.setContent(comment.getContent());
                commentDTO.setCreatedAt(comment.getCreatedAt());
                
                UserDTO commentAuthorDTO = new UserDTO();
                commentAuthorDTO.setId(comment.getAuthor().getId());
                commentAuthorDTO.setName(comment.getAuthor().getName());
                commentAuthorDTO.setAvatar(comment.getAuthor().getAvatar());
                commentDTO.setAuthor(commentAuthorDTO);
                
                return commentDTO;
            })
            .collect(Collectors.toList());
        
        dto.setComments(commentDTOs);
        
        return dto;
    }
}