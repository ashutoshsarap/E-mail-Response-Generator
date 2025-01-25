package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    //To inject WebClient we will create its constructor

    @Value("${gemini.api.url}") //Injects from application properties
    private String geminiApiUrl; //We have to do API call using URL

    @Value("${gemini.api.key}") //Injects from application properties
    private String geminiApiKey; //We have to do API call using API KEY

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {

        //Build the prompt
        String prompt=buildPrompt(emailRequest);

        //The prompt will go to Gemini API
        //We wil craft a request here
        Map<String,Object>  requestBody=Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                }
        );
        //Do request and get response
        //We need to do the API call using gemini.api.url and gemini.api.key along with the prompt
        //To do the API call we will need to use WebClient it's a way to do an api request
        //It is build on top of project reactor
        // it enables us to handle  asynchronous non-blocking HTTP request and responses
        //to do so we have added dependencies

        String response=webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        //Extract response and Return response
        return extractResponseContent(response);

    }

    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }catch (Exception e){
            return "Error processing request  "+e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't generate a subject line ");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal Email : \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

}
