package com.devexp.dto;

import com.devexp.models.User;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private int age;
    private String phone;

    public UserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.age = user.getAge();
        this.phone = user.getPhone();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public int getAge() { return age; }
    public String getPhone() { return phone; }
}
