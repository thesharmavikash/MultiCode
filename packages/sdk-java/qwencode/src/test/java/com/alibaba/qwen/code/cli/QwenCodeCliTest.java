package com.alibaba.param.code.cli;

import java.util.List;

import com.alibaba.param.code.cli.transport.TransportOptions;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.*;

class paramCodeCliTest {

    private static final Logger log = LoggerFactory.getLogger(paramCodeCliTest.class);
    @Test
    void simpleQuery() {
        List<String> result = paramCodeCli.simpleQuery("hello world");
        log.info("simpleQuery result: {}", result);
        assertNotNull(result);
    }

    @Test
    void simpleQueryWithModel() {
        List<String> result = paramCodeCli.simpleQuery("hello world", new TransportOptions().setModel("param-plus"));
        log.info("simpleQueryWithModel result: {}", result);
        assertNotNull(result);
    }
}
