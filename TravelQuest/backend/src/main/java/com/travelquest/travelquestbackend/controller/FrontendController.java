package com.travelquest.travelquestbackend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = "/")
    public String home() {
        return "forward:/index.html";
    }

    @RequestMapping(value = {"/", "/**/{path:[^\\.]*}"})
    public String redirect() {
        return "forward:/index.html";
    }

}
