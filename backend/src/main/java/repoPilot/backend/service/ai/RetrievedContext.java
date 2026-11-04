package repoPilot.backend.service.ai;


import repoPilot.backend.dto.CitationDto;

import java.util.List;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText
) {}