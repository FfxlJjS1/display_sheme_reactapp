export class CommunicationWithServer {
    static schemeApi = "api/Scheme";
    
    static async GetRequest(request) {
        const response = await fetch(request);

        if (response.ok) {
            const data = await response.json();

            return data;
        }

        return null;
    }

    static async GetTipNpoTable() {
        const data = this.GetRequest(this.schemeApi + "/GetTipNpoTable");

        return data;
    }

    static async GetParentInjectionOutList() {
        const data = this.GetRequest(this.schemeApi + "/GetParentInjectionOutList");

        return data;
    }

    static async GetInjectionInOutClassification(is_injection_in_classification) {
        const data = this.GetRequest(this.schemeApi + "/GetInjectionInOutClassification?is_injection_in_classification=" + is_injection_in_classification);

        return data;
    }
    
    static async GetInjectionOutTreeTable(productParkId, selectedTipNpoIds) {
        let selectedTipNpoIdsString = selectedTipNpoIds.join(';');

        if(selectedTipNpoIdsString == "") {
            selectedTipNpoIdsString = "0";
        }

        const data = this.GetRequest(this.schemeApi + "/GetInjectionOutTreeTable?productParkId=" + productParkId
            + "&selectedTipNpoIdsString=" + selectedTipNpoIdsString); // 1;2;3;4;5;6;7;10;11;12;13;14;16;25;26;27

        return data;
    }

    static async GetInjectionInTreeTable(productParkId, selectedTipNpoIds) {
        let selectedTipNpoIdsString = selectedTipNpoIds.join(';');

        if (selectedTipNpoIdsString == "") {
            selectedTipNpoIdsString = "0";
        }

        const data = this.GetRequest(this.schemeApi + "/GetInjectionInTreeTable?productParkId=" + productParkId
            + "&selectedTipNpoIdsString=" + selectedTipNpoIdsString); // 1;2;3;4;5;6;7;10;11;12;13;14;16;25;26;27

        return data;
    }

    static async GetObjectFullInfo(objectId) {
        const data = this.GetRequest(this.schemeApi + "/GetObjectInfo?objectId=" + objectId);

        return data;
    }
}