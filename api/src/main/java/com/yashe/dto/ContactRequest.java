package com.yashe.dto;

import com.yashe.entity.ContactMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ContactRequest {
    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名不能超过50个字符")
    private String name;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱过长")
    private String email;

    @Size(max = 20, message = "电话号码过长")
    private String phone;

    @Size(max = 100, message = "主题不能超过100个字符")
    private String subject;

    @Pattern(regexp = "^$|0-30万|30-80万|80-150万|150万以上", message = "预算范围无效")
    private String budget;

    @NotBlank(message = "留言内容不能为空")
    @Size(min = 5, max = 5000, message = "留言内容需为5到5000个字符")
    private String message;

    @NotBlank(message = "请完成人机验证")
    @Size(max = 2048, message = "人机验证参数无效")
    private String turnstileToken;

    public ContactMessage toEntity() {
        ContactMessage entity = new ContactMessage();
        entity.setName(name.trim());
        entity.setEmail(email.trim().toLowerCase());
        entity.setPhone(trimToNull(phone));
        entity.setSubject(trimToNull(subject));
        entity.setBudget(trimToNull(budget));
        entity.setMessage(message.trim());
        return entity;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTurnstileToken() { return turnstileToken; }
    public void setTurnstileToken(String turnstileToken) { this.turnstileToken = turnstileToken; }
}
