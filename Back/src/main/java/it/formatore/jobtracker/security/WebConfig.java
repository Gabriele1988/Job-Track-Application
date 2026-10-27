package it.formatore.jobtracker.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final WriteProtectionInterceptor writeProtectionInterceptor;

    public WebConfig(WriteProtectionInterceptor writeProtectionInterceptor) {
        this.writeProtectionInterceptor = writeProtectionInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(writeProtectionInterceptor).addPathPatterns("/rest/**");
    }
}
