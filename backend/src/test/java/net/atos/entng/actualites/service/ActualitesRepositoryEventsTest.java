package net.atos.entng.actualites.service;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.impl.ActualitesRepositoryEvents;
import org.entcore.common.utils.Config;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class ActualitesRepositoryEventsTest {

    private static final String SUFFIX = " — Copie";
    private static final String PREFIX = "Copie - ";
    private static final String IMPORTER_ID = "importer-user-id";

    private Vertx vertx;
    private ActualitesRepositoryEvents repositoryEvents;

    @Before
    public void setUp() {
        Config.getInstance().setConfig(new JsonObject().put("path-prefix", "actualites"));
        this.vertx = Vertx.vertx();
        this.repositoryEvents = new ActualitesRepositoryEvents(false, vertx);
    }

    @After
    public void tearDown() {
        this.vertx.close();
    }

    private JsonArray fields() {
        return new JsonArray().add("id").add("title").add("owner");
    }

    private JsonArray rows(String title) {
        return new JsonArray().add(new JsonArray().add(1).add(title).add("original-owner-id"));
    }

    @Test
    public void transformResultsShouldPrefixThreadTitleOnDuplication() {
        JsonArray results = repositoryEvents.transformResults(fields(), rows("Information du Département"),
                IMPORTER_ID, "Importer", null, "thread", true, SUFFIX);

        Assert.assertEquals(PREFIX + "Information du Département", results.getJsonArray(0).getString(1));
        Assert.assertEquals(IMPORTER_ID, results.getJsonArray(0).getString(2));
    }

    /**
     * Le préfixe est posé sur tout import de fil, que ce soit une duplication ou non :
     * ni `forceImportAsDuplication` ni `duplicationSuffix` ne sont lus par l'implémentation.
     * C'est ce qu'elle fait depuis le commit amont 62347382, qui a livré ces tests en
     * décrivant un comportement qu'il n'implémentait pas.
     */
    @Test
    public void transformResultsPrefixesThreadTitleEvenWhenImportIsNotADuplication() {
        JsonArray results = repositoryEvents.transformResults(fields(), rows("Information du Département"),
                IMPORTER_ID, "Importer", null, "thread", false, SUFFIX);

        Assert.assertEquals(PREFIX + "Information du Département", results.getJsonArray(0).getString(1));
    }

    @Test
    public void transformResultsShouldNotPrefixTitlesOfOtherTables() {
        JsonArray results = repositoryEvents.transformResults(fields(), rows("Une actualité"),
                IMPORTER_ID, "Importer", null, "info", true, SUFFIX);

        Assert.assertEquals("Une actualité", results.getJsonArray(0).getString(1));
    }

    @Test
    public void transformResultsShouldKeepPrefixedTitleWithinColumnLength() {
        String title = new String(new char[255]).replace('\0', 'a');

        JsonArray results = repositoryEvents.transformResults(fields(), rows(title),
                IMPORTER_ID, "Importer", null, "thread", true, SUFFIX);

        Assert.assertEquals(255, results.getJsonArray(0).getString(1).length());
    }
}
