package net.atos.entng.actualites.controllers.v1;

import io.vertx.core.json.JsonObject;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Tests de la normalisation/validation du champ {@code status} à la création d'une actualité.
 * <p>Verrouille la régression corrigée (anomalies #1/#2 de la fiche 01_actualites) : le front
 * n'envoie pas de {@code status} pour un brouillon, le back doit alors le défaut à DRAFT (1)
 * au lieu de renvoyer 400 « Status should be in DRAFT or PENDING ». Le statut est un entier.
 */
public class InfosControllerV1Test {

	@Test
	public void statusAbsent_defautDraft_estValide() {
		// Cas du brouillon créé depuis le front : aucun 'status' envoyé.
		JsonObject resource = new JsonObject().put("title", "Mon brouillon");

		boolean valide = InfosControllerV1.normalizeAndValidateCreateStatus(resource);

		assertTrue("un statut absent doit être accepté (défaut DRAFT)", valide);
		assertEquals("le statut doit être renseigné à DRAFT (1)", Integer.valueOf(1), resource.getInteger("status"));
	}

	@Test
	public void statusDraft_estValide() {
		JsonObject resource = new JsonObject().put("status", 1);

		assertTrue(InfosControllerV1.normalizeAndValidateCreateStatus(resource));
		assertEquals(Integer.valueOf(1), resource.getInteger("status"));
	}

	@Test
	public void statusPending_estValide() {
		JsonObject resource = new JsonObject().put("status", 2);

		assertTrue(InfosControllerV1.normalizeAndValidateCreateStatus(resource));
		assertEquals(Integer.valueOf(2), resource.getInteger("status"));
	}

	@Test
	public void statusPublished_estRejete() {
		// PUBLISHED (3) n'est pas autorisé sur createInfo (réservé à createPublishedInfo).
		JsonObject resource = new JsonObject().put("status", 3);

		assertFalse("le statut 3 (PUBLISHED) doit être rejeté par createInfo", InfosControllerV1.normalizeAndValidateCreateStatus(resource));
	}

	@Test
	public void statusHorsPlage_estRejete() {
		JsonObject resource = new JsonObject().put("status", 42);

		assertFalse(InfosControllerV1.normalizeAndValidateCreateStatus(resource));
	}
}
