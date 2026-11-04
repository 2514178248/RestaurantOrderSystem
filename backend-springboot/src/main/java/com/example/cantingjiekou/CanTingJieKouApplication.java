package com.example.cantingjiekou;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("com.example.cantingjiekou.mapper")
public class CanTingJieKouApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanTingJieKouApplication.class, args);
    }

}
