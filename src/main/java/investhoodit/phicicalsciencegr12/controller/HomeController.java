package investhoodit.phicicalsciencegr12.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public String home() {
        return "paper-two";
    }
    @GetMapping("/paper-two")
    public String showPaperTwo() {
        return "paper-two";
    }
}
