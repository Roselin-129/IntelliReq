import spacy


class NLPPreprocessor:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def process(self, text: str):

        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")

        doc = self.nlp(text)

        # Sentence segmentation
        sentences = [
            sentence.text.strip()
            for sentence in doc.sents
        ]

        # Tokens
        tokens = [
            token.text
            for token in doc
            if not token.is_space
        ]

        # Lemmatization
        lemmas = [
            token.lemma_.lower()
            for token in doc
            if not token.is_space and not token.is_punct
        ]

        # Important words excluding stop words
        keywords = [
            token.lemma_.lower()
            for token in doc
            if not token.is_stop
            and not token.is_punct
            and token.is_alpha
        ]

        # Named entities
        entities = [
            {
                "text": entity.text,
                "label": entity.label_
            }
            for entity in doc.ents
        ]

        return {
            "text": text,
            "sentence_count": len(sentences),
            "token_count": len(tokens),
            "sentences": sentences,
            "tokens": tokens,
            "lemmas": lemmas,
            "keywords": keywords,
            "entities": entities
        }