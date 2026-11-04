package repoPilot.backend.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class VectorStoreConfig {

//    @Bean
//    public VectorStore vectorStore(
//            JdbcTemplate jdbcTemplate,
//            EmbeddingModel embeddingModel,
//            @org.springframework.beans.factory.annotation.Value("${spring.ai.vectorstore.pgvector.dimension:768}") int dimension
//    ) {
//        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
//                .dimensions(dimension)
//                .initializeSchema(false)
//                .build();
//    }
}